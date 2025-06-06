defmodule TempiWeb.Employer.JobController do
  use TempiWeb, :controller
  alias Tempi.Jobs

  def index(conn, _params) do
    jobs = Jobs.list_jobs()

    conn
    |> assign_prop(:jobs, jobs)
    |> render_inertia("employer/Agenda")
  end

  def new(conn, _params) do
    conn
    |> render_inertia("employer/AddJob")
  end

  def create(conn, params) do
    employer_profile_id = conn.assigns.current_user.employer.id

    case Jobs.create_job(employer_profile_id, params) do
      {:ok, job} ->
        conn
        |> assign_prop(:job, job)
        |> redirect(to: ~p"/employer/agenda")

      {:error, changeset} ->
        conn
        |> assign_errors(changeset)
        |> render_inertia("employer/AddJob")
    end
  end
end
