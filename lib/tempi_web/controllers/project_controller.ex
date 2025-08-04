defmodule TempiWeb.ProjectController do
  use TempiWeb, :controller
  alias Tempi.Projects

  def index(conn, _params) do
    current_user = current_user(conn)
    projects = Projects.projects_for_user(current_user)

    render(conn, :index, projects: projects)
  end

  def create(conn, params) do
    current_user = conn.assigns.current_user

    with {:ok, project} <- Projects.create_project(params, current_user) do
      conn
      |> put_status(:created)
      |> render(:show, project: project)
    end
  end
end
