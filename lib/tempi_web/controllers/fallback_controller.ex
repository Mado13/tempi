defmodule TempiWeb.FallbackController do
  use TempiWeb, :controller
  require Logger

  def call(conn, {:error, :rate_limit, retry_after}),
    do: render_error(conn, :too_many_requests, "RATE_LIMIT_EXCEEDED", %{retry_after: retry_after})

  def call(conn, {:error, error_code}) when is_binary(error_code),
    do: render_error(conn, :unprocessable_entity, error_code)

  def call(conn, {:error, :invalid_phone}),
    do: render_error(conn, :bad_request, "INVALID_PHONE_FORMAT")

  def call(conn, {:error, :invalid}), do: render_error(conn, :unauthorized, "INVALID_AUTH_CODE")

  def call(conn, {:error, :missing_params, _params}),
    do: render_error(conn, :bad_request, "MISSING_PARAMETERS")

  def call(conn, {:error, :missing_auth_header}),
    do: render_error(conn, :unauthorized, "MISSING_AUTH_HEADER")

  def call(conn, {:error, :logout_failed}),
    do: render_error(conn, :internal_server_error, "LOGOUT_FAILED")

  @doc """
  Handles Ecto changesets separately as its structure is unique.
  """
  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    error_details = inspect(changeset.errors)
    Logger.warning("Validation failed - IP: #{get_client_ip(conn)} - Errors: #{error_details}")

    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: TempiWeb.ErrorJSON)
    |> render(:"422", changeset: changeset)
  end

  defp render_error(conn, status, error_code, assigns \\ %{}) do
    Logger.warning("#{error_code} for #{conn.request_path} - IP: #{get_client_ip(conn)}")

    status_code_str = to_string(Plug.Conn.Status.code(status))
    render_assigns = Map.put(assigns, :error_code, error_code)

    conn
    |> put_status(status)
    |> put_view(json: TempiWeb.ErrorJSON)
    |> render(:"#{status_code_str}", render_assigns)
  end

  defp get_client_ip(conn) do
    conn.remote_ip |> :inet.ntoa() |> to_string()
  end
end
