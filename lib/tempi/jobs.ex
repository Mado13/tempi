# lib/tempi/jobs.ex
defmodule Tempi.Jobs do
  require Logger
  import Ecto.Query
  alias Tempi.Repo
  alias Tempi.{Job, Address, JobClassification, Profiles}

  @doc """
  Lists all jobs, sorted by most recent.
  """
  def list_jobs do
    from(j in Job,
      order_by: [desc: j.inserted_at],
      preload: [:address, :job_classifications, :company_profile]
    )
    |> Repo.all()
  end

  @doc """
  Gets a single job by its ID.
  Returns nil if the job is not found.
  """
  def get_job(id) do
    Repo.get(Job, id)
  end

  @doc """
  Create job with address and classifications in one transaction
  """
  def create_job(params, current_user) do
    Repo.transaction(fn ->
      with {:ok, company_profile_id} <-
             validate_company_ownership(params["company_profile_id"], current_user),
           {:ok, address} <- find_or_create_address(params["address"]),
           # Pass user
           {:ok, job} <-
             create_job_with_address(params, address.id, current_user, company_profile_id),
           {:ok, _classifications} <-
             create_job_classifications(job.id, params["job_classifications"]) do
        job |> Repo.preload([:address, :job_classifications])
      else
        {:error, reason} when is_binary(reason) ->
          Logger.error("Job creation failed (string): #{reason}")
          Repo.rollback(reason)

        {:error, %Ecto.Changeset{} = changeset} ->
          Logger.error("Job creation failed (changeset): #{inspect(changeset.errors)}")
          Repo.rollback(changeset)

        {:error, reason} ->
          Logger.error("Job creation failed (other): #{inspect(reason)}")
          Repo.rollback("JOB_CREATION_FAILED")
      end
    end)
  end

  # Find jobs near coordinates
  def jobs_near(lat, lng, radius_km \\ 30) do
    point = %Geo.Point{coordinates: {lng, lat}, srid: 4326}
    radius_meters = radius_km * 1000

    from(j in Job,
      join: a in Address,
      on: j.address_id == a.id,
      where: fragment("ST_DWithin(?, ?, ?)", a.coordinates, ^point, ^radius_meters),
      preload: [:address, :job_classifications]
    )
    |> Repo.all()
  end

  # Find jobs by locality
  def jobs_in_locality(locality) do
    from(j in Job,
      join: a in Address,
      on: j.address_id == a.id,
      where: a.locality == ^locality,
      preload: [:address, :job_classifications]
    )
    |> Repo.all()
  end

  # Find jobs for specific user
  def jobs_for_user(user) do
    user
    |> Repo.preload(employer_profile: [jobs: [:address, :job_classifications, :company_profile]])
    |> then(fn user ->
      case user.employer_profile do
        nil -> []
        profile -> Enum.sort_by(profile.jobs, & &1.inserted_at, :desc)
      end
    end)
  end

  # Find jobs by district
  def jobs_in_district(district) do
    from(j in Job,
      join: a in Address,
      on: j.address_id == a.id,
      where: a.district == ^district,
      preload: [:address, :job_classifications]
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

  defp create_job_with_address(params, address_id, current_user, company_profile_id) do
    employer_profile = Repo.get_by(Tempi.Profiles.EmployerProfile, user_id: current_user.id)

    case employer_profile do
      nil ->
        {:error, "USER_HAS_NO_EMPLOYER_PROFILE"}

      profile ->
        job_attrs = %{
          "address_id" => address_id,
          "employer_profile_id" => profile.id,
          "company_profile_id" => company_profile_id,
          "start_date" => params["date"]["start"],
          "end_date" => params["date"]["end"],
          "number_of_employees" => params["number_of_employees"],
          "rate" => params["payment"]["rate"],
          "rate_type" => params["payment"]["rate_type"]
        }

        %Job{}
        |> Job.changeset(job_attrs)
        |> Repo.insert()
    end
  end

  defp create_job_classifications(job_id, classification_map) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

    classifications =
      Enum.map(classification_map, fn {code, _name} ->
        %{
          job_id: job_id,
          classification_code: code,
          inserted_at: now,
          updated_at: now
        }
      end)

    case Repo.insert_all(JobClassification, classifications) do
      {_count, _} -> {:ok, classifications}
      _error -> {:error, "JOB_CLASSIFICATION_FAILED"}
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
