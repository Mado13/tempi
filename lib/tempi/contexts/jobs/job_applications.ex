defmodule Tempi.Contexts.Jobs.JobApplications do
  alias Ecto.Multi
  alias Tempi.Repo
  alias Tempi.Schemas.Jobs.JobApplication
  import Tempi.Contexts.Jobs.JobAgreement, only: [create_job_agreement: 1]

  def get_job_application(id) do
    Repo.get!(JobApplication, id) |> Repo.preload(:job)
  end

  def create_job_application(attrs) do
    %JobApplication{}
    |> JobApplication.changeset(attrs)
    |> Repo.insert()
  end

  def update_job_application(job_application, attrs) do
    multi =
      Multi.new()
      |> Multi.update(:job_application, JobApplication.changeset(job_application, attrs))

    multi =
      if attrs[:status] == :completed and job_application.status != :completed do
        Multi.run(multi, :job_agreement, fn _repo, %{job_application: updated_app} ->
          create_job_agreement(%{
            job_id: updated_app.job_id,
            worker_profile_id: updated_app.worker_profile_id,
            employer_profile_id: updated_app.job.employer_profile_id,
            job_application_id: updated_app.id,
            completed_at: DateTime.utc_now()
          })
        end)
      else
        multi
      end

    Repo.transaction(multi)
  end
end
