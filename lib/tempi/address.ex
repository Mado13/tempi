defmodule Tempi.Address do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "addresses" do
    field :google_place_id, :string
    field :formatted_address, :string
    field :locality, :string
    field :district, :string
    field :coordinates, Geo.PostGIS.Geometry

    has_many :jobs, Tempi.Job
    timestamps()
  end

  def changeset(address, attrs) do
    address
    |> cast(attrs, [:google_place_id, :formatted_address, :locality, :district])
    |> validate_required([:google_place_id, :formatted_address])
    |> unique_constraint(:google_place_id)
    |> put_coordinates(attrs)
  end

  defp put_coordinates(changeset, %{"location" => %{"lat" => lat, "lng" => lng}})
       when is_number(lat) and is_number(lng) do
    point = %Geo.Point{coordinates: {lng, lat}, srid: 4326}
    put_change(changeset, :coordinates, point)
  end

  defp put_coordinates(changeset, %{location: %{lat: lat, lng: lng}})
       when is_number(lat) and is_number(lng) do
    point = %Geo.Point{coordinates: {lng, lat}, srid: 4326}
    put_change(changeset, :coordinates, point)
  end

  defp put_coordinates(changeset, _attrs) do
    add_error(changeset, :coordinates, "valid location with lat/lng is required")
  end

  # Helper functions for extracting lat/lng
  def lat(%__MODULE__{coordinates: %Geo.Point{coordinates: {_lng, lat}}}), do: lat
  def lat(_), do: nil

  def lng(%__MODULE__{coordinates: %Geo.Point{coordinates: {lng, _lat}}}), do: lng
  def lng(_), do: nil
end
