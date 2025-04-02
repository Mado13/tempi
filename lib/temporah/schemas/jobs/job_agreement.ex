defmodule Temporah.Schemas.Jobs.JobAgreement do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "job_agreements" do
    belongs_to :job, Temporah.Schemas.Jobs.Job
    belongs_to :worker_profile, Temporah.Schemas.Profiles.WorkerProfile
    belongs_to :employer_profile, Temporah.Schemas.Profiles.EmployerProfile
    belongs_to :job_application, Temporah.Schemas.Jobs.JobApplication

    field :completed_at, :utc_datetime

    timestamps(type: :utc_datetime)
  end

  def changeset(agreement, attrs) do
    agreement
    |> cast(attrs, [:job_id, :worker_profile_id, :employer_profile_id, :job_application_id, :completed_at])
    |> validate_required([:job_id, :worker_profile_id, :employer_profile_id, :job_application_id, :completed_at])
    |> foreign_key_constraint(:job_id)
    |> foreign_key_constraint(:worker_profile_id)
    |> foreign_key_constraint(:employer_profile_id)
    |> foreign_key_constraint(:job_application_id)
  end
end
