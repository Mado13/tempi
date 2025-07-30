defmodule TempiWeb.JobJSON do
  def index(%{jobs: jobs}) do
    for(job <- jobs, do: data(job))
  end

  def show(%{job: job}) do
    data(job)
  end

  defp data(job) do
    %{
      id: job.id,
      status: job.status,
      address: %{
        formatted_address: job.address.formatted_address,
        locality: job.address.locality,
        district: job.address.district
      },
      date: %{
        start: job.start_date,
        end: job.end_date
      },
      number_of_employees: job.number_of_employees,
      job_classifications: Enum.map(job.job_classifications, & &1.classification_code),
      favorites_count: job.favorites_count
    }
  end
end
