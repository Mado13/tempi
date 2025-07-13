defmodule Tempi.RateLimit do
  @moduledoc """
  Rate limiting using Hammer
  """

  use Hammer, backend: :ets
end
