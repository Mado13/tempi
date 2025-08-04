# lib/tempi_web/controllers/supabase_token_controller.ex
defmodule TempiWeb.SupabaseTokenController do
  use TempiWeb, :controller

  def create(conn, _params) do
    current_user = current_user(conn)

    case Tempi.Supabase.Client.generate_jwt(current_user.id) do
      {:ok, token} ->
        json(conn, %{
          token: token,
          expires_at: System.system_time(:second) + 3600
        })

      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Token generation failed", reason: inspect(reason)})
    end
  end
end
