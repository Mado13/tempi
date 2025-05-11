defmodule Tempi.Repo.Migrations.CreateJobAgreements do
  use Ecto.Migration

  def change do
    create table(:job_agreements, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :job_id, references(:jobs, type: :binary_id, on_delete: :nothing), null: false

      add :worker_profile_id, references(:worker_profiles, type: :binary_id, on_delete: :nothing),
        null: false

      add :employer_profile_id,
          references(:employer_profiles, type: :binary_id, on_delete: :nothing),
          null: false

      add :job_application_id,
          references(:job_applications, type: :binary_id, on_delete: :nothing),
          null: false

      add :completed_at, :utc_datetime, null: false

      timestamps(type: :utc_datetime)
    end

    create index(:job_agreements, [:job_id])
    create index(:job_agreements, [:worker_profile_id])
    create index(:job_agreements, [:employer_profile_id])
    create index(:job_agreements, [:job_application_id])
    create index(:job_agreements, [:worker_profile_id, :employer_profile_id])
  end
end
