defmodule TempiWeb.UserController do
  use TempiWeb, :controller

  alias TempiWeb.ApiAuth
  alias Tempi.{Accounts, Repo}

  action_fallback TempiWeb.FallbackController

  @doc """
  GET /api/profile

  Returns current user profile (requires bearer token)
  """
  def profile(conn, _params) do
    current_user = ApiAuth.current_user(conn)

    json(conn, %{
      user: %{
        id: current_user.id,
        phone_number: current_user.phone_number
      }
    })
  end

  def create_role(conn, %{"current_role" => role}) do
    case Accounts.create_user_profile(current_user(conn), role) do
      {:ok, updated_user} ->
        updated_user = Repo.preload(updated_user, [:employer_profile, :worker_profile])
        render(conn, :current_user, user: updated_user)
    end
  end

  def update_role(conn, %{"current_role" => new_role}) do
    user = ApiAuth.current_user(conn)

    case Accounts.update_user_role(user, %{current_role: new_role}) do
      {:ok, updated_user} ->
        render(conn, :current_user, user: updated_user)
    end
  end

  def current_user(conn, _params) do
    user =
      ApiAuth.current_user(conn)
      |> Repo.preload([:employer_profile, :worker_profile])

    json(conn, %{user: user})
  end
end
