# lib/tempi/jobs.ex
defmodule Tempi.Jobs do
  import Ecto.Query
  alias Tempi.Repo
  alias Tempi.{Job, Address, JobClassification}

  # Create job with address and classifications in one transaction
  def create_job(params, current_user) do
    Repo.transaction(fn ->
      with {:ok, address} <- find_or_create_address(params["address"]),
           # Pass user
           {:ok, job} <- create_job_with_address(params, address.id, current_user),
           {:ok, _classifications} <-
             create_job_classifications(job.id, params["job_classification"]) do
        job |> Repo.preload([:address, :job_classifications])
      else
        {:error, reason} when is_binary(reason) -> Repo.rollback(reason)
        {:error, %Ecto.Changeset{} = changeset} -> Repo.rollback(changeset)
        {:error, _reason} -> Repo.rollback("JOB_CREATION_FAILED")
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
    |> Repo.preload(employer_profile: [jobs: [:address, :job_classifications]])
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

    # Debug log to see what's happening
    IO.inspect(address_attrs, label: "address_attrs")
    IO.inspect(google_place_id, label: "google_place_id")

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

  defp create_job_with_address(params, address_id, current_user) do
    employer_profile = Repo.get_by(Tempi.Profiles.EmployerProfile, user_id: current_user.id)

    case employer_profile do
      nil ->
        {:error, "USER_HAS_NO_EMPLOYER_PROFILE"}

      profile ->
        job_attrs = %{
          "address_id" => address_id,
          "employer_profile_id" => profile.id,
          "start_date" => params["date"]["start"],
          "end_date" => params["date"]["end"],
          "number_of_employees" => params["number_of_employees"]
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
end
