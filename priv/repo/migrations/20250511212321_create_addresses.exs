defmodule Tempi.Repo.Migrations.CreateAddresses do
  use Ecto.Migration

  def change do
    create table(:addresses, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :place_id, :string
      add :street_number, :string
      add :street_name, :string
      add :city, :string
      add :district, :string
      add :country, :string
      add :postal_code, :string
      add :formatted_address, :string
      add :latitude, :float
      add :longitude, :float

      timestamps()
    end

    # Add PostGIS geometry column with explicit constraints
    execute("SELECT AddGeometryColumn ('addresses','location',4326,'POINT',2);", "")

    # Add spatial index for performance
    execute("CREATE INDEX addresses_location_idx ON addresses USING GIST (location);", "")

    create unique_index(:addresses, [:place_id], where: "place_id IS NOT NULL")
  end
end
