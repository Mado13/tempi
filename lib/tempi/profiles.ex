defmodule Tempi.Profiles do
  import Ecto.Query
  alias Tempi.Repo
  alias Tempi.Profiles.{CompanyProfile, EmployerProfile, WorkerProfile}

  def create_company_profile(attrs) do
    %CompanyProfile{}
    |> CompanyProfile.changeset(attrs)
    |> Repo.insert()
  end

  def get_company_profiles_for_user(user_id) do
    from(cp in CompanyProfile,
      join: ep in EmployerProfile,
      on: cp.employer_profile_id == ep.id,
      where: ep.user_id == ^user_id,
      preload: [:address, :employer_profile]
    )
    |> Repo.all()
  end

  def get_company_profile_for_user(company_profile_id, user_id) do
    from(cp in CompanyProfile,
      join: ep in EmployerProfile,
      on: cp.employer_profile_id == ep.id,
      where: cp.id == ^company_profile_id and ep.user_id == ^user_id,
      preload: [:address, :employer_profile]
    )
    |> Repo.one()
  end

  def update_company_profile(company_profile, attrs) do
    company_profile
    |> CompanyProfile.changeset(attrs)
    |> Repo.update()
  end

  def delete_company_profile(company_profile) do
    Repo.delete(company_profile)
  end

  def user_owns_company_profile?(company_profile_id, user_id) do
    from(cp in CompanyProfile,
      join: ep in EmployerProfile,
      on: cp.employer_profile_id == ep.id,
      where: cp.id == ^company_profile_id and ep.user_id == ^user_id,
      select: true
    )
    |> Repo.exists?()
  end

  def get_worker_profile_for_user(user) do
    case Repo.preload(user, :worker_profile).worker_profile do
      nil -> {:error, :worker_profile_required}
      worker_profile -> {:ok, worker_profile}
    end
  end

  def update_worker_profile(worker_profile, attrs) do
    worker_profile
    |> WorkerProfile.changeset(attrs)
    |> Repo.update()
  end
end
