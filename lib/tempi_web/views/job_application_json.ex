defmodule TempiWeb.JobApplicationJSON do
  def show(%{job_application: job_application}) do
    data(job_application)
  end

  def index(%{applications: applications}) do
    %{data: Enum.map(applications, &data/1)}
  end

  defp data(job_application) do
    %{
      id: job_application.id,
      status: job_application.status,
      position_id: job_application.position_id,
      project_id: job_application.project_id,
      worker_profile_id: job_application.worker_profile_id,
      applied_at: job_application.inserted_at
    }
  end
end
