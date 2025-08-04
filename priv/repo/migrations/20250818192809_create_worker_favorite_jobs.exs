defmodule Tempi.Repo.Migrations.CreateWorkerFavoriteProjectPositions do
  use Ecto.Migration

  def change do
    create table(:worker_favorite_project_positions, primary_key: false) do
      add :id, :binary_id, primary_key: true

      add :worker_profile_id,
          references(:worker_profiles, type: :binary_id, on_delete: :delete_all),
          null: false

      add :project_position_id,
          references(:project_positions, type: :binary_id, on_delete: :delete_all),
          null: false

      timestamps(updated_at: false)
    end

    create index(:worker_favorite_project_positions, [:worker_profile_id])
    create index(:worker_favorite_project_positions, [:project_position_id])

    create unique_index(
             :worker_favorite_project_positions,
             [:worker_profile_id, :project_position_id],
             name: :worker_favorite_project_positions_worker_id_position_id_index
           )
  end
end
