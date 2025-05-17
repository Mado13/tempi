defmodule Tempi.Utils.Camelize do
  def camelize(value) when is_list(value) do
    if Keyword.keyword?(value) do
      value |> Enum.into(%{}) |> camelize()
    else
      Enum.map(value, &camelize/1)
    end
  end

  def camelize(tuple) when is_tuple(tuple), do: tuple |> Tuple.to_list() |> Enum.map(&camelize/1)

  def camelize(%_struct{} = struct) do
    struct
    |> Map.from_struct()
    |> Map.drop([:__meta__, :__struct__])
    |> camelize()
  end

  def camelize(%{} = map) do
    map
    |> Enum.map(fn {k, v} ->
      key =
        case k do
          k when is_atom(k) or is_binary(k) -> Recase.to_camel(to_string(k))
          _ -> to_string(k)
        end

      {key, camelize(v)}
    end)
    |> Enum.into(%{})
  end

  def camelize(val), do: val
end
