defmodule Tempi.WorkerFavoriteProjectPosition do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "worker_favorite_project_positions" do
    belongs_to :worker_profile, Tempi.Profiles.WorkerProfile
    belongs_to :project_position, Tempi.ProjectPosition
    timestamps(updated_at: false)
  end

  @doc """
  Builds a changeset for a favorite project position entry.
  """
  def changeset(favorite, attrs) do
    favorite
    |> cast(attrs, [:worker_profile_id, :project_position_id])
    |> validate_required([:worker_profile_id, :project_position_id])
    |> foreign_key_constraint(:worker_profile_id)
    |> foreign_key_constraint(:project_position_id)
    |> unique_constraint([:worker_profile_id, :project_position_id],
      name: :worker_favorite_project_positions_worker_id_position_id_index,
      message: "has already been favorited"
    )
  end
end
