# Path: lib/tempi_web/controllers/favorite_controller.ex
defmodule TempiWeb.FavoriteController do
  use TempiWeb, :controller

  alias Tempi.Favorites
  # Assuming a Projects context exists
  alias Tempi.Projects

  @doc """
  Receives a project_position_id, finds the current worker, and toggles the favorite status.
  """
  def toggle(conn, %{"project_position_id" => project_position_id}) do
    # This assumes you have an authentication plug that loads the current user
    # and their associated worker_profile into conn.assigns.
    # You might need to adjust this depending on your auth implementation.
    with worker_profile <- conn.assigns.current_user.worker_profile,
         # We fetch the project position to ensure it exists before proceeding.
         %Tempi.ProjectPosition{} = project_position <-
           Projects.get_project_position(project_position_id),
         # We call the context function to perform the core logic.
         {:ok, status, updated_position} <-
           Favorites.toggle_favorite(project_position, worker_profile) do
      conn
      |> put_status(:ok)
      |> render(:toggle, status: status, project_position: updated_position)
    end
  end
end
