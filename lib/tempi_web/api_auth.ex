defmodule TempiWeb.ApiAuth do
  @moduledoc """
  Plug for API authentication using bearer tokens.
  """

  import Plug.Conn
  import Phoenix.Controller

  alias Tempi.Accounts

  def init(opts), do: opts

  @doc """
  Authenticates API requests using bearer tokens.

  Expects Authorization header: "Bearer <token>"
  Sets current_user in conn.assigns if valid.
  Returns 401 if token is missing or invalid.
  """
  def call(conn, _opts) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, user} <- Accounts.fetch_user_by_api_token(token) do
      assign(conn, :current_user, user)
    else
      [] ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Missing authorization header"})
        |> halt()

      [_invalid_header] ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid authorization header format. Use: Bearer <token>"})
        |> halt()

      :error ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid or expired token"})
        |> halt()
    end
  end

  @doc """
  Helper function to get current user from connection.
  Use this in your controllers: current_user = ApiAuth.current_user(conn)
  """
  def current_user(conn) do
    conn.assigns[:current_user]
  end
end
