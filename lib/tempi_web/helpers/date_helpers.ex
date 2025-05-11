defmodule TempiWeb.Helpers.DateHelpers do
  @moduledoc false

  def parse_date!(date_string) do
    Date.from_iso8601!(date_string)
    |> DateTime.new!(~T[00:00:00], "Etc/UTC")
  end
end
