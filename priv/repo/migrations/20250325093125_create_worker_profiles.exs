defmodule MyApp.Repo.Migrations.CreateWorkerProfiles do
  use Ecto.Migration

  def change do
    create table(:worker_profiles, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :account_id, references(:accounts, type: :uuid, on_delete: :delete_all), null: false
      add :full_name, :string
      timestamps(updated_at: :updated_at, inserted_at: false)
    end

    create unique_index(:worker_profiles, [:account_id])
  end
end
