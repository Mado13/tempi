defmodule TempiWeb.JobsController do
  use TempiWeb, :controller
  alias Tempi.Jobs

  def create(conn, params) do
    with {:ok, job} <- Jobs.create_job(params, current_user(conn)) do
      conn
      |> put_status(:created)
      |> json(%{
        id: job.id,
        address: %{
          formatted_address: job.address.formatted_address,
          locality: job.address.locality,
          district: job.address.district
        },
        start_date: job.start_date,
        end_date: job.end_date,
        number_of_employees: job.number_of_employees,
        classifications: Enum.map(job.job_classifications, & &1.classification_code)
      })
    end
  end

  def index(conn, _params) do
    jobs = Jobs.jobs_for_user(current_user(conn))

    json(conn, %{
      jobs:
        Enum.map(jobs, fn job ->
          %{
            id: job.id,
            address: %{
              formatted_address: job.address.formatted_address,
              locality: job.address.locality,
              district: job.address.district
            },
            start_date: job.start_date,
            end_date: job.end_date,
            number_of_employees: job.number_of_employees,
            classifications: Enum.map(job.job_classifications, & &1.classification_code)
          }
        end)
    })
  end
end
