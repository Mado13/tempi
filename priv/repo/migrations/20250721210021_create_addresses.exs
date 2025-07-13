defmodule Tempi.Repo.Migrations.CreateAddresses do
  use Ecto.Migration

  def up do
    execute("CREATE EXTENSION IF NOT EXISTS postgis")

    create table(:addresses, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :google_place_id, :string, null: false
      add :formatted_address, :string, null: false
      add :locality, :string, null: false
      add :district, :string, null: false
      add :coordinates, :geometry, null: false

      timestamps()
    end

    create unique_index(:addresses, [:google_place_id])
    create index(:addresses, [:coordinates], using: :gist)
    create index(:addresses, [:locality])
    create index(:addresses, [:district])
  end

  def down do
    drop table(:addresses)
    execute("DROP EXTENSION IF EXISTS postgis")
  end
end
