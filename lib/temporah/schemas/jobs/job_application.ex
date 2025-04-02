defmodule Temporah.Schemas.Jobs.JobApplication do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @derive {Jason.Encoder, only: [:id, :status, :job_id, :worker_profile_id]}

  schema "job_application" do
    field :status, Ecto.Enum, values: [:applied, :confirmed, :rejected, :completed, :canceled], default: :applied

    belongs_to :job, Temporah.Schemas.Jobs.Job
    belongs_to :worker_profile, Temporah.Schemas.Profiles.WorkerProfile

    timestamps(type: :utc_datetime)
  end

  @doc """
  Changeset for creating and updating job applications
  """
  def changeset(job_application, attrs) do
    job_application
    |> cast(attrs, [:status, :job_id, :worker_profile_id])
    |> validate_required([:job_id, :worker_profile_id])
    |> foreign_key_constraint(:job_id)
    |> foreign_key_constraint(:worker_profile_id)
    |> unique_constraint([:job_id, :worker_profile_id], name: :job_worker_unique_index)
  end
end
