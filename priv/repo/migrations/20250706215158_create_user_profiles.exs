defmodule Tempi.Repo.Migrations.CreateUserProfiles do
  use Ecto.Migration

  def change do
    create table(:employer_profiles, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :company_name, :string
      add :business_type, :string
      add :description, :text
      add :location, :string
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:employer_profiles, [:user_id])

    create table(:worker_profiles, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :full_name, :string
      add :skills, {:array, :string}, default: []
      add :experience_years, :integer
      add :bio, :text
      add :hourly_rate, :decimal, precision: 10, scale: 2
      add :availability, :string
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:worker_profiles, [:user_id])
    create index(:worker_profiles, [:availability])
    create index(:worker_profiles, [:hourly_rate])
  end
end
