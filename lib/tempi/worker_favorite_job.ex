defmodule Tempi.WorkerFavoriteJob do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "worker_favorite_jobs" do
    belongs_to :worker_profile, Tempi.Profiles.WorkerProfile
    belongs_to :job, Tempi.Job

    timestamps(updated_at: false)
  end

  @doc """
  Builds a changeset for a favorite job entry.
  """
  def changeset(favorite, attrs) do
    favorite
    |> cast(attrs, [:worker_profile_id, :job_id])
    |> validate_required([:worker_profile_id, :job_id])
    |> foreign_key_constraint(:worker_profile_id)
    |> foreign_key_constraint(:job_id)
    |> unique_constraint([:worker_profile_id, :job_id],
      name: :worker_favorite_jobs_worker_id_job_id_index,
      message: "has already been favorited"
    )
  end
end
