defmodule Tempi.Repo.Migrations.CreateProjectsAndProjectPositions do
  use Ecto.Migration

  def up do
    execute(
      "CREATE TYPE public.project_status AS ENUM ('published','in_progress','completed','canceled','archived');"
    )

    execute("CREATE TYPE public.position_status AS ENUM ('open','filled','closed','canceled');")

    execute("CREATE TYPE public.rate_type AS ENUM ('daily','hourly');")

    create table(:projects, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :start_date, :date, null: false
      add :end_date, :date, null: false
      add :notes, :text
      add :status, :project_status, null: false, default: "published"
      add :meta, :map, null: false, default: %{}

      add :address_id, references(:addresses, type: :binary_id, on_delete: :nilify_all)

      add :employer_profile_id,
          references(:employer_profiles, type: :binary_id, on_delete: :restrict),
          null: false

      add :company_profile_id,
          references(:company_profiles, type: :binary_id, on_delete: :restrict),
          null: false

      timestamps()
    end

    create constraint(:projects, :end_after_start, check: "end_date >= start_date")
    create index(:projects, [:company_profile_id, :status])
    create index(:projects, [:start_date, :end_date])

    create table(:project_positions, primary_key: false) do
      add :id, :binary_id, primary_key: true

      add :project_id, references(:projects, type: :binary_id, on_delete: :delete_all),
        null: false

      add :title, :string, null: false
      add :rate, :decimal, null: false
      add :rate_type, :rate_type, null: false, default: "hourly"
      add :currency, :string, null: false, default: "NIS"
      add :status, :position_status, null: false, default: "open"
      add :classification_code, :string, null: false
      add :number_of_employees, :integer, null: false, default: 1
      add :applications_count, :integer, null: false, default: 0
      add :favorites_count, :integer, null: false, default: 0
      add :notes, :text

      timestamps()
    end

    create index(:project_positions, [:project_id])
    create index(:project_positions, [:classification_code])
    create index(:project_positions, [:status])
  end

  def down do
    drop table(:project_positions)
    drop table(:projects)
    execute("DROP TYPE public.position_status;")
    # execute("DROP TYPE public.rate_type;") NOTE:See comment at the top
    execute("DROP TYPE public.project_status;")
  end
end
