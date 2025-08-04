defmodule Tempi.Repo.Migrations.CreateJobApplications do
  use Ecto.Migration

  @disable_ddl_transaction true

  def change do
    execute(
      "CREATE TYPE public.job_application_status AS ENUM ('submitted', 'viewed', 'shortlisted', 'rejected', 'hired')",
      "DROP TYPE public.job_application_status"
    )

    create table(:job_applications, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :status, :job_application_status, null: false, default: "submitted"

      add :position_id, references(:project_positions, type: :binary_id, on_delete: :delete_all)

      add :worker_profile_id,
          references(:worker_profiles, type: :binary_id, on_delete: :delete_all)

      timestamps()
    end

    create index(:job_applications, [:position_id])
    create index(:job_applications, [:worker_profile_id])

    create unique_index(:job_applications, [:position_id, :worker_profile_id],
             name: :job_applications_position_id_worker_profile_id_index
           )
  end
end
