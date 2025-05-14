defmodule Tempi.Contexts.Locations.AddressBuilder do
  @moduledoc """
  Builds address attributes from Google Places API components.
  """
  def build(%{
        "address_id" => place_id,
        "formatted_address" => formatted_address,
        "location" => %{"lat" => lat, "lng" => lng},
        "address_components" => address_components
      }) do
    %{
      place_id: place_id,
      formatted_address: formatted_address,
      latitude: lat,
      longitude: lng,
      street_name: get_street_name(address_components),
      street_number: get_street_number(address_components),
      city: get_city(address_components),
      district: get_district(address_components),
      postal_code: get_postal_code(address_components),
      country: get_country(address_components)
    }
  end

  defp get_street_name(components), do: extract_component(components, "route")
  defp get_street_number(components), do: extract_component(components, "street_number")
  defp get_city(components), do: extract_component(components, "locality")
  defp get_district(components), do: extract_component(components, "administrative_area_level_2")
  defp get_postal_code(components), do: extract_component(components, "postal_code")
  defp get_country(components), do: extract_component(components, "country")

  defp extract_component(components, type) do
    components
    |> Enum.find(fn component -> type in component["types"] end)
    |> case do
      nil -> ""
      component -> Map.get(component, "long_text", "")
    end
  end
end
