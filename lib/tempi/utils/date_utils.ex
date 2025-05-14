defmodule Tempi.Utils.DateHelpers do
  @moduledoc false

  @spec parse_date!(String.t()) :: DateTime.t()
  def parse_date!(date_string) do
    Date.from_iso8601!(date_string)
    |> DateTime.new!(~T[00:00:00], "Etc/UTC")
  end
end
