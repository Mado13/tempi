defmodule Tempi.Repo.Migrations.CreateWorkerFavoriteJobs do
  use Ecto.Migration

  def change do
    create table(:worker_favorite_jobs, primary_key: false) do
      add :id, :binary_id, primary_key: true

      add :worker_profile_id,
          references(:worker_profiles, type: :binary_id, on_delete: :delete_all),
          null: false

      add :position_id, references(:project_positions, type: :binary_id, on_delete: :delete_all),
        null: false

      timestamps(updated_at: false)
    end

    create index(:worker_favorite_jobs, [:worker_profile_id])
    create index(:worker_favorite_jobs, [:position_id])

    create unique_index(:worker_favorite_jobs, [:worker_profile_id, :position_id],
             name: :worker_favorite_jobs_worker_id_job_id_index
           )
  end
end
