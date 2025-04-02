defmodule Temporah.Repo.Migrations.CreateJobApplications do
  use Ecto.Migration

  def change do
    create_query =
      "CREATE TYPE application_status AS ENUM ('applied', 'confirmed', 'rejected', 'completed', 'canceled')"

    drop_query = "DROP TYPE application_status"

    execute(create_query, drop_query)

    create table(:job_applications, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :status, :application_status, null: false, default: "applied"

      add :job_id, references(:jobs, type: :binary_id, on_delete: :nothing), null: false

      add :worker_profile_id, references(:worker_profiles, type: :binary_id, on_delete: :nothing),
        null: false

      timestamps(type: :utc_datetime)
    end

    create index(:job_applications, [:job_id])
    create index(:job_applications, [:worker_profile_id])

    create unique_index(:job_applications, [:job_id, :worker_profile_id],
             name: :job_worker_unique_index
           )
  end
end
