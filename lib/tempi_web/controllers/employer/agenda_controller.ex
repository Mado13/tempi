defmodule TempiWeb.Employer.AgendaController do
  use TempiWeb, :controller
  alias Tempi.Jobs

  # Explicit pattern matching for params with month/year
  def index(conn, %{"month" => month, "year" => year}) do
    with {:ok, naive_date} <- Timex.parse("#{year}-#{month}-01", "{YYYY}-{M}-{D}"),
         datetime <- Timex.to_datetime(naive_date, "Etc/UTC") do
      render_agenda(conn, datetime)
    else
      _error ->
        conn
        |> put_flash(:error, "Invalid date provided.")
        |> render_inertia("employer/Agenda")
    end
  end

  # Fallback for missing params
  def index(conn, _params) do
    render_agenda(conn, Timex.now("Etc/UTC"))
  end

  def index(conn) do
    render_agenda(conn, Timex.now("Etc/UTC"))
  end

  defp render_agenda(conn, %DateTime{} = datetime) do
    jobs = Jobs.list_jobs(datetime)

    conn
    |> assign_prop(:jobs, jobs)
    |> render_inertia("employer/Agenda")
  end
end
