defmodule Tempi.JobApplication do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @statuses [:submitted, :viewed, :shortlisted, :rejected, :hired]

  schema "job_applications" do
    field :status, Ecto.Enum, values: @statuses, default: :submitted

    belongs_to :job, Tempi.Job
    belongs_to :worker_profile, Tempi.Profiles.WorkerProfile

    timestamps()
  end

  @doc """
  Builds a changeset for a job application.
  """
  def changeset(job_application, attrs) do
    job_application
    |> cast(attrs, [:job_id, :worker_profile_id, :status])
    |> validate_required([:job_id, :worker_profile_id])
    |> validate_inclusion(:status, @statuses)
    |> foreign_key_constraint(:job_id)
    |> foreign_key_constraint(:worker_profile_id)
    |> unique_constraint([:job_id, :worker_profile_id],
      name: :job_applications_job_id_worker_profile_id_index
    )
  end
end
