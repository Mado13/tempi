defmodule TempiWeb.JobController do
  use TempiWeb, :controller
  alias Tempi.Jobs

  def create(conn, params) do
    with {:ok, job} <- Jobs.create_job(params, current_user(conn)) do
      conn
      |> put_status(:created)
      |> render(:show, job: job)
    end
  end

  def index(conn, _params) do
    user = current_user(conn)
    IO.inspect(user, label: "amido")

    jobs =
      if user.current_role == :employer do
        Jobs.jobs_for_user(user)
      else
        Jobs.list_jobs()
      end

    render(conn, :index, jobs: jobs)
  end
end
