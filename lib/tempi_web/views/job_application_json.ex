defmodule TempiWeb.JobApplicationJson do
  defmodule TempiWeb.JobApplicationJSON do
    def show(%{job_application: job_application}) do
      data(job_application)
    end

    def index(%{job_applications: job_applications}) do
      for job_application <- job_applications, do: data(job_application)
    end

    defp data(job_application) do
      %{
        id: job_application.id,
        status: job_application.status,
        position_id: job_application.position_id,
        worker_profile_id: job_application.worker_profile_id,
        applied_at: job_application.inserted_at
      }
    end
  end
end
