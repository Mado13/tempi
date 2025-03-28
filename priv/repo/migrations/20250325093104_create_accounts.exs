defmodule MyApp.Repo.Migrations.CreateAccounts do
  use Ecto.Migration

  def change do
    create table(:accounts, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false
      add :type, :string, null: false

      timestamps()
    end

    create unique_index(:accounts, [:user_id])

    create constraint(:accounts, :account_type_check,
             check: "type IN ('worker', 'employer', 'both')"
           )
  end
end
