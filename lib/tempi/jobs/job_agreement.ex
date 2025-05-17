defmodule Tempi.Jobs.JobAgreement do
  @moduledoc "Represents a job agreement linking job, worker, employer, and application."
  use Ecto.Schema
  import Ecto.Changeset
  alias Tempi.Jobs.{JobApplication, Job}
  alias Tempi.Profiles.{WorkerProfile, EmployerProfile}

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "job_agreements" do
    belongs_to :job, Job
    belongs_to :worker_profile, WorkerProfile
    belongs_to :employer_profile, EmployerProfile
    belongs_to :job_application, JobApplication

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
