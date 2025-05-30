defmodule Tempi.Locations.Address do
  @moduledoc """
  Schema and changeset for address records.

  Handles address fields, geocoordinates, and basic validations.
  """
  use Ecto.Schema
  import Ecto.Changeset
  use Tempi.Encoders.CamelCaseJsonEncoder, except: [:__meta__, :jobs, :inserted_at, :updated_at]

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "addresses" do
    field :place_id, :string
    field :street_number, :string
    field :street_name, :string
    field :city, :string
    field :country, :string
    field :district, :string
    field :postal_code, :string
    field :formatted_address, :string
    field :latitude, :float
    field :longitude, :float
    field :location, Geo.PostGIS.Geometry

    has_many :jobs, Tempi.Jobs.Job

    timestamps()
  end

  @doc """
  Changeset for creating/updating an address.
  - Ensures place_id is unique (if present).
  - Validates presence of essential fields.
  """
  def changeset(address, attrs) do
    address
    |> cast(attrs, [
      :place_id,
      :street_number,
      :street_name,
      :city,
      :district,
      :country,
      :postal_code,
      :formatted_address,
      :latitude,
      :longitude
    ])
    |> validate_length(:place_id, max: 255)
    |> validate_length(:street_number, max: 50)
    |> validate_length(:street_name, max: 255)
    |> validate_length(:city, max: 255)
    |> validate_length(:district, max: 255)
    |> validate_length(:country, max: 255)
    |> validate_length(:postal_code, max: 50)
    |> validate_length(:formatted_address, max: 1024)
    |> unique_constraint(:place_id, name: :addresses_place_id_index)
    |> validate_required([:formatted_address, :latitude, :longitude])
    |> put_location_geomtry()
  end

  def put_location_geomtry(changeset) do
    case {get_field(changeset, :latitude), get_field(changeset, :longitude)} do
      {lat, lng} when not is_nil(lat) and not is_nil(lng) ->
        geomtry = %Geo.Point{coordinates: {lat, lng}}
        put_change(changeset, :location, geomtry)

      _ ->
        changeset
    end
  end
end
