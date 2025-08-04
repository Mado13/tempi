defmodule Tempi.Projects do
  require Logger
  import Ecto.Query
  alias Tempi.Repo
  alias Tempi.{Project, ProjectPositions, Address, Profiles}

  @doc """
  Lists all projects, sorted by most recent.
  """
  def list_projects do
    from(p in Project,
      order_by: [desc: p.inserted_at],
      preload: [:address, :positions, :company_profile]
    )
    |> Repo.all()
  end

  @doc """
  Gets a single project by its ID.
  Returns nil if the project is not found.
  """
  def get_project(id) do
    Repo.get(Project, id)
  end

  @doc """
  Create project with address and positions in one transaction
  """
  def create_project(params, current_user) do
    Repo.transaction(fn ->
      with {:ok, company_profile_id} <-
             validate_company_ownership(params["company_profile_id"], current_user),
           {:ok, address} <- find_or_create_address(params["address"]),
           {:ok, project} <-
             create_project_with_address(params, address.id, current_user, company_profile_id),
           {:ok, _count} <-
             ProjectPositions.create_positions_for_project(project.id, params["positions"]) do
        project |> Repo.preload([:address, :positions, :company_profile])
      else
        {:error, reason} when is_binary(reason) ->
          Logger.error("Project creation failed (string): #{reason}")
          Repo.rollback(reason)

        {:error, %Ecto.Changeset{} = changeset} ->
          Logger.error("Project creation failed (changeset): #{inspect(changeset.errors)}")
          Repo.rollback(changeset)

        {:error, reason} ->
          Logger.error("Project creation failed (other): #{inspect(reason)}")
          Repo.rollback("PROJECT_CREATION_FAILED")
      end
    end)
  end

  # Find projects near coordinates
  def projects_near(lat, lng, radius_km \\ 30) do
    point = %Geo.Point{coordinates: {lng, lat}, srid: 4326}
    radius_meters = radius_km * 1000

    from(p in Project,
      join: a in Address,
      on: p.address_id == a.id,
      where: fragment("ST_DWithin(?, ?, ?)", a.coordinates, ^point, ^radius_meters),
      preload: [:address, :positions]
    )
    |> Repo.all()
  end

  # Find projects by locality
  def projects_in_locality(locality) do
    from(p in Project,
      join: a in Address,
      on: p.address_id == a.id,
      where: a.locality == ^locality,
      preload: [:address, :positions]
    )
    |> Repo.all()
  end

  # Find projects for specific user
  def projects_for_user(user) do
    user
    |> Repo.preload(employer_profile: [projects: [:address, :positions, :company_profile]])
    |> then(fn user ->
      case user.employer_profile do
        nil -> []
        profile -> Enum.sort_by(profile.projects, & &1.inserted_at, :desc)
      end
    end)
  end

  # Find projects by district
  def projects_in_district(district) do
    from(p in Project,
      join: a in Address,
      on: p.address_id == a.id,
      where: a.district == ^district,
      preload: [:address, :positions]
    )
    |> Repo.all()
  end

  # Private functions
  defp find_or_create_address(address_attrs) do
    google_place_id = address_attrs["google_place_id"]

    case google_place_id do
      nil ->
        {:error, "Missing google_place_id"}

      id when is_binary(id) ->
        case Repo.get_by(Address, google_place_id: id) do
          nil ->
            %Address{}
            |> Address.changeset(address_attrs)
            |> Repo.insert()

          address ->
            {:ok, address}
        end
    end
  end

  defp create_project_with_address(params, address_id, current_user, company_profile_id) do
    employer_profile = Repo.get_by(Tempi.Profiles.EmployerProfile, user_id: current_user.id)

    case employer_profile do
      nil ->
        {:error, "USER_HAS_NO_EMPLOYER_PROFILE"}

      profile ->
        project_attrs = %{
          "name" => params["name"],
          "address_id" => address_id,
          "employer_profile_id" => profile.id,
          "company_profile_id" => company_profile_id,
          "start_date" => params["date"]["start"],
          "end_date" => params["date"]["end"],
          "notes" => params["notes"],
          "meta" => params["meta"] || %{}
        }

        %Project{}
        |> Project.changeset(project_attrs)
        |> Repo.insert()
    end
  end

  defp validate_company_ownership(company_profile_id, current_user) do
    if Profiles.user_owns_company_profile?(company_profile_id, current_user.id) do
      {:ok, company_profile_id}
    else
      {:error, "COMPANY_PROFILE_NOT_FOUND_OR_UNAUTHORIZED"}
    end
  end
end
