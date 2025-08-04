defmodule TempiWeb.JobJSON do
  def index(%{jobs: jobs, signed_urls: signed_urls}) do
    for job <- jobs, do: data(job, signed_urls)
  end

  def show(%{job: job, signed_urls: signed_urls}) do
    data(job, signed_urls)
  end

  defp data(job, signed_urls) do
    logo_key = job.company_profile.logo_key
    logo_url = if logo_key, do: Map.get(signed_urls, logo_key)

    %{
      id: job.id,
      status: job.status,
      company: %{
        name: job.company_profile.name,
        logo_url: logo_url
      },
      address: %{
        formatted_address: job.address.formatted_address,
        locality: job.address.locality,
        district: job.address.district
      },
      date: %{
        start: job.start_date,
        end: job.end_date
      },
      payment: %{
        rate: job.rate,
        rate_type: job.rate_type
      },
      number_of_employees: job.number_of_employees,
      job_classifications: Enum.map(job.job_classifications, & &1.classification_code),
      favorites_count: job.favorites_count,
      created_at: job.inserted_at
    }
  end
end
