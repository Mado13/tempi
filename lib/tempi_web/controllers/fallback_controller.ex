defmodule TempiWeb.FallbackController do
  use Phoenix.Controller
  require Logger

  def call(conn, {:error, :rate_limit, retry_after}) do
    Logger.warning("Rate limit exceeded for #{conn.request_path} - IP: #{get_client_ip(conn)}")

    conn
    |> put_status(:too_many_requests)
    |> put_view(json: TempiWeb.ErrorJSON)
    |> render(:"429", error_code: "RATE_LIMIT_EXCEEDED", retry_after: retry_after)
  end

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    Logger.warning("Validation failed - IP: #{get_client_ip(conn)}")

    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: TempiWeb.ErrorJSON)
    |> render(:"422", changeset: changeset)
  end

  def call(conn, {:error, :invalid_phone}) do
    Logger.warning("Invalid phone number format - IP: #{get_client_ip(conn)}")

    conn
    |> put_status(:bad_request)
    |> put_view(json: TempiWeb.ErrorJSON)
    |> render(:"400", error_code: "INVALID_PHONE_FORMAT")
  end

  def call(conn, {:error, :invalid}) do
    Logger.warning("Invalid auth code attempt - IP: #{get_client_ip(conn)}")

    conn
    |> put_status(:unauthorized)
    |> put_view(json: TempiWeb.ErrorJSON)
    |> render(:"401", error_code: "INVALID_AUTH_CODE")
  end

  def call(conn, {:error, :missing_params, params}) do
    Logger.warning("Missing required parameters: #{params} - IP: #{get_client_ip(conn)}")

    conn
    |> put_status(:bad_request)
    |> put_view(json: TempiWeb.ErrorJSON)
    |> render(:"400", error_code: "MISSING_PARAMETERS")
  end

  def call(conn, {:error, :missing_auth_header}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(json: TempiWeb.ErrorJSON)
    |> render(:"401", error_code: "MISSING_AUTH_HEADER")
  end

  def call(conn, {:error, :logout_failed}) do
    Logger.error("Logout failed for authenticated user - IP: #{get_client_ip(conn)}")

    conn
    |> put_status(:internal_server_error)
    |> put_view(json: TempiWeb.ErrorJSON)
    |> render(:"500", error_code: "LOGOUT_FAILED")
  end

  defp get_client_ip(conn) do
    conn.remote_ip |> :inet.ntoa() |> to_string()
  end
end
