defmodule TempiWeb.ProjectApplicantController do
  use TempiWeb, :controller
  alias Tempi.Projects

  def index(conn, %{"project_id" => project_id}) do
    applicants = Projects.list_project_applicants(project_id)
    render(conn, :index, applicants: applicants)
  end
end
