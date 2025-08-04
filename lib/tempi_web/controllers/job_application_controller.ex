defmodule TempiWeb.JobApplicationController do
  use TempiWeb, :controller
  alias Tempi.{JobApplications, Profiles, FCM}

  def index(conn, _params) do
    current_user = current_user(conn)
    applications_by_project = JobApplications.list_applications_for_employer(current_user.id)

    render(conn, :index, applications: applications_by_project)
  end

  def create(conn, %{"project_position_id" => project_position_id}) do
    current_user = current_user(conn)

    with {:ok, worker_profile} <- Profiles.get_worker_profile_for_user(current_user),
         {:ok, job_application} <-
           JobApplications.create_job_application(project_position_id, worker_profile) do
      employer_user = job_application.position.project.employer_profile.user

      FCM.notify(employer_user, %{
        type: "application:created",
        title: "New Job Application",
        body: "Someone applied for your position!",
        data: %{project_id: "123", application_id: "456"}
      })

      conn
      |> put_status(:created)
      |> render(:show, job_application: job_application)
    end
  end
end
