# Path: lib/tempi_web/controllers/favorite_controller.ex
defmodule TempiWeb.FavoriteController do
  use TempiWeb, :controller

  alias Tempi.Favorites
  # Assuming a Jobs context exists
  alias Tempi.Jobs

  @doc """
  Receives a job_id, finds the current worker, and toggles the favorite status.
  """
  def toggle(conn, %{"job_id" => job_id}) do
    # This assumes you have an authentication plug that loads the current user
    # and their associated worker_profile into conn.assigns.
    # You might need to adjust this depending on your auth implementation.
    with worker_profile <- conn.assigns.current_user.worker_profile,
         # We fetch the job to ensure it exists before proceeding.
         %Tempi.Job{} = job <- Jobs.get_job(job_id),
         # We call the context function to perform the core logic.
         {:ok, status, updated_job} <- Favorites.toggle_favorite(job, worker_profile) do
      conn
      |> put_status(:ok)
      |> render(:toggle, status: status, job: updated_job)
    end
  end
end
