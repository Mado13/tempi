defmodule Tempi.JobApplications do
  alias Tempi.{JobApplication, Repo}

  def create_job_application(position_id, worker_profile) do
    %JobApplication{}
    |> JobApplication.changeset(%{
      position_id: position_id,
      worker_profile_id: worker_profile.id
    })
    |> Repo.insert()
  end
end
