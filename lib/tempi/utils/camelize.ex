defmodule Tempi.Encoders.CamelCaseJsonEncoder do
  defmacro __using__(opts) do
    excluded_fields = Keyword.get(opts, :except, [])
    included_fields = Keyword.get(opts, :only, [])

    if excluded_fields != [] and included_fields != [] do
      raise ArgumentError, "Cannot use both :only and :except options"
    end

    quote location: :keep do
      @behaviour Jason.Encoder

      defimpl Jason.Encoder do
        def encode(struct, json_opts) do
          struct
          |> Map.from_struct()
          |> Tempi.Encoders.CamelCaseJsonEncoder.filter_fields(unquote(excluded_fields), unquote(included_fields))
          |> Tempi.Encoders.CamelCaseJsonEncoder.convert_map_keys_to_camel_case()
          |> Jason.Encode.map(json_opts)
        end
      end
    end
  end

  def filter_fields(data, [], []) do
    data
  end

  def filter_fields(data, excluded_fields, []) do
    Map.drop(data, excluded_fields)
  end

  def filter_fields(data, [], included_fields) do
    Map.take(data, included_fields)
  end

  def convert_map_keys_to_camel_case(data) when is_map(data) do
    for {key, val} <- data, into: %{} do
      string_key = if is_atom(key), do: Atom.to_string(key), else: to_string(key)
      new_key = Recase.to_camel(string_key)
      new_val = transform_value(val)
      {new_key, new_val}
    end
  end

  defp transform_value(value) when is_struct(value) do
    value
  end

  defp transform_value(value) when is_map(value) do
    convert_map_keys_to_camel_case(value)
  end

  defp transform_value(value) when is_list(value) do
    Enum.map(value, &transform_value/1)
  end

  defp transform_value(value) do
    value
  end
end
