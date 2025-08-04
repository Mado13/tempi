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

    IO.inspect(user, label: "user")

    jobs =
      if user.current_role == :employer do
        Jobs.jobs_for_user(user)
      else
        Jobs.list_jobs()
      end

    logo_keys =
      jobs
      |> Enum.map(& &1.company_profile.logo_key)
      |> Enum.reject(&is_nil/1)

    signed_urls =
      Tempi.Storage.sign_many(logo_keys)

    IO.inspect(signed_urls, label: "signed")

    render(conn, :index, jobs: jobs, signed_urls: signed_urls)
  end
end
