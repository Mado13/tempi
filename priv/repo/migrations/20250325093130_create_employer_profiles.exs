defmodule MyApp.Repo.Migrations.CreateEmployerProfiles do
  use Ecto.Migration

  def change do
    create table(:employer_profiles, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :account_id, references(:accounts, type: :uuid, on_delete: :delete_all), null: false
      add :company_name, :string
      timestamps(updated_at: :updated_at, inserted_at: false)
    end

    create unique_index(:employer_profiles, [:account_id])
  end
end
