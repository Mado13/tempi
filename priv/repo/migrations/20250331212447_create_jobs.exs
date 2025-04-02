defmodule Temporah.Repo.Migrations.CreateJobs do
  use Ecto.Migration

  def change do
    create_query = "CREATE TYPE job_status AS ENUM ('open', 'filled', 'completed', 'canceled')"
    drop_query = "DROP TYPE job_status"
    execute(create_query, drop_query)

    create table(:jobs, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :title, :string, null: false
      add :description, :string
      add :location, :string
      add :start_date, :utc_datetime, null: false
      add :end_date, :utc_datetime, null: false
      add :pay_rate, :decimal, precision: 10, scale: 2
      add :status, :job_status, null: false, default: "open"

      add :employer_profile_id,
          references(:employer_profiles, type: :binary_id, on_delete: :nothing),
          null: false

      timestamps(type: :utc_datetime)
    end

    create index(:jobs, [:employer_profile_id])
    create index(:jobs, [:status])
    create index(:jobs, [:start_date, :end_date])
  end
end
