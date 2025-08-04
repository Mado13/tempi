defmodule TempiWeb.JobApplicationController do
  use TempiWeb, :controller
  alias Tempi.{JobApplications, Profiles}

  def create(conn, %{"project_position_id" => project_position_id}) do
    current_user = current_user(conn)

    with {:ok, worker_profile} <- Profiles.get_worker_profile_for_user(current_user),
         {:ok, job_application} <-
           JobApplications.create_job_application(project_position_id, worker_profile) do
      conn
      |> put_status(:created)
      |> render(:show, job_application: job_application)
    end
  end
end
