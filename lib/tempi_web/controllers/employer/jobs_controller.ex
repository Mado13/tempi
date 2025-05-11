defmodule TempiWeb.Employer.JobsController do
  use TempiWeb, :controller
  import TempiWeb.Helpers.DateHelpers
  alias Tempi.Contexts.Jobs.Jobs

  def index(conn, _params) do
    jobs = Jobs.list_jobs()

    conn
    |> assign_prop(:jobs, jobs)
    |> render_inertia("Employer/Agenda")
  end

  def new(conn, _params) do
    conn
    |> render_inertia("Employer/AddJob")
  end

  def create(
        conn,
        %{
          "start_date" => start_date,
          "end_date" => end_date
        } = params
      ) do
    employer_profile_id = conn.assigns.current_user.employer.id
    start_date_utc = parse_date!(start_date)
    end_date_utc = parse_date!(end_date)

    attrs =
      params
      |> Map.put("employer_profile_id", employer_profile_id)
      |> Map.put("start_date", start_date_utc)
      |> Map.put("end_date", end_date_utc)

    case Jobs.create_job(attrs) do
      {:ok, _job} ->
        redirect(conn, to: ~p"/employer/agenda")

      {:error, changeset} ->
        conn
        |> assign_errors(changeset)
        |> render_inertia("Employer/Agenda")
    end
  end
end
