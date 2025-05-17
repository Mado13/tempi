defmodule Tempi.Locations do
  @moduledoc """
  Functions for building and inserting address records.
  """
  alias Tempi.Repo
  alias Tempi.Locations.{Address, AddressBuilder}

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
