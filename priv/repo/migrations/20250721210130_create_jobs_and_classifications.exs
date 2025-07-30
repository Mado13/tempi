defmodule Tempi.Repo.Migrations.CreateJobsAndClassifications do
  use Ecto.Migration

  # This is required to allow CREATE TYPE and CREATE TABLE in the same migration.
  @disable_ddl_transaction true

  def change do
    # Create ENUM types and provide the command to drop them on rollback.
    execute(
      "CREATE TYPE public.rate_type AS ENUM ('hourly', 'daily');",
      "DROP TYPE public.rate_type;"
    )

    execute(
      "CREATE TYPE public.job_status AS ENUM ('open', 'filled', 'finished', 'canceled');",
      "DROP TYPE public.job_status;"
    )

    create table(:jobs, primary_key: false) do
      add :id, :binary_id, primary_key: true

      add :employer_profile_id,
          references(:employer_profiles, type: :binary_id, on_delete: :delete_all),
          null: false

      add :address_id, references(:addresses, type: :binary_id, on_delete: :delete_all),
        null: false

      add :status, :job_status, null: false, default: "open"
      add :rate_type, :rate_type, null: false, default: "hourly"
      add :rate, :decimal, precision: 8, scale: 2, null: false
      add :start_date, :date, null: false
      add :end_date, :date, null: false
      add :number_of_employees, :integer, null: false
      timestamps()
    end

    create table(:job_classifications, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :job_id, references(:jobs, type: :binary_id, on_delete: :delete_all), null: false
      add :classification_code, :string, null: false
      timestamps()
    end

    create index(:jobs, [:address_id])
    create index(:jobs, [:start_date, :end_date])
    create index(:job_classifications, [:job_id])
    create index(:job_classifications, [:classification_code])
    create unique_index(:job_classifications, [:job_id, :classification_code])
  end
end
