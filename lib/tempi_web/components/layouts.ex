defmodule TempiWeb.Layouts do
  @moduledoc """
  This module holds different layouts used by your application.

  See the `layouts` directory for all templates available.
  The "root" layout is a skeleton rendered as part of the
  application router. The "app" layout is set as the default
  layout on both `use TempiWeb, :controller` and
  `use TempiWeb, :live_view`.
  """
  use TempiWeb, :html

  embed_templates "layouts/*"
  def dev_env?, do: Application.get_env(:tempi, :env) == :dev
end
