defmodule TempiWeb.RequestLogger do
  @moduledoc """
  Custom request logger that outputs clean, colorized one-line logs.
  """
  require Logger
  @behaviour Plug

  def init(opts), do: opts

  def call(conn, _opts) do
    start_time = System.monotonic_time()

    Plug.Conn.register_before_send(conn, fn conn ->
      # Calculate request duration
      stop_time = System.monotonic_time()
      duration = System.convert_time_unit(stop_time - start_time, :native, :microsecond)
      duration_ms = div(duration, 100) / 10

      # Determine status color
      {status_color, status_emoji} =
        case conn.status do
          s when s >= 500 -> {:red, "❌"}
          s when s >= 400 -> {:yellow, "⚠️ "}
          s when s >= 300 -> {:cyan, "↪️ "}
          s when s < 300 -> {:green, "✓"}
          _ -> {:normal, "•"}
        end

      # Format params (filtered)
      params =
        case conn.params do
          %{} = p when map_size(p) == 0 -> ""
          p -> " params=#{inspect(Phoenix.Logger.filter_values(p))}"
        end

      # Get controller/action info if available
      controller_action =
        case conn.private do
          %{phoenix_controller: controller, phoenix_action: action} ->
            " #{inspect(controller)}.#{action}"

          _ ->
            ""
        end

      # Build redirect info if applicable
      redirect =
        case Plug.Conn.get_resp_header(conn, "location") do
          [location | _] -> " → #{location}"
          _ -> ""
        end

      # Format the log message
      Logger.info(
        "#{status_emoji} #{conn.method} #{conn.request_path}#{controller_action} " <>
          "#{conn.status}#{redirect} #{duration_ms}ms#{params}",
        ansi_color: status_color
      )

      conn
    end)
  end
end
