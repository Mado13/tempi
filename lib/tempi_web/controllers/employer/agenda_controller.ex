defmodule TempiWeb.Employer.AgendaController do
  use TempiWeb, :controller
  alias Tempi.Contexts.Jobs.Jobs

  def index(conn, %{"month" => month, "year" => year}) do
    case Timex.parse("#{year}-#{month}-01", "{YYYY}-{M}-{D}") do
      {:ok, naive_date} ->
        datetime = Timex.to_datetime(naive_date, "Etc/UTC")
        render_agenda(conn, datetime)
    end
  end

  def index(conn, _params) do
    render_agenda(conn, Timex.now("Etc/UTC"))
  end

  defp render_agenda(conn, %DateTime{} = datetime) do
    jobs = Jobs.list_jobs(datetime)

    conn
    |> assign_prop(:jobs, jobs)
    |> render_inertia("Employer/Agenda")
  end
end
