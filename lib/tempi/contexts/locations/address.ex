defmodule Tempi.Contexts.Locations.Address do
  alias Tempi.Repo
  alias Tempi.Schemas.Locations.Address
  alias Tempi.Contexts.Locations.AddressBuilder

  @doc """
  Creates an address from raw parameters (e.g., from a controller).
  """
  def create_address(attrs) do
    address_attrs = AddressBuilder.build(attrs)

    %Address{}
    |> Address.changeset(address_attrs)
    |> Repo.insert()
  end
end
