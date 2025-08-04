defmodule Tempi.JobApplications do
  import Ecto.Query, warn: false
  alias Tempi.{JobApplication, Repo}

  def create_job_application(position_id, worker_profile) do
    %JobApplication{}
    |> JobApplication.changeset(%{
      position_id: position_id,
      worker_profile_id: worker_profile.id
    })
    |> Repo.insert()
    |> case do
      {:ok, job_application} ->
        job_application =
          Repo.preload(job_application, position: [project: [employer_profile: :user]])

        {:ok, job_application}

      error ->
        error
    end
  end

  def list_applications_for_employer(user_id) do
    query =
      from ja in JobApplication,
        join: pos in assoc(ja, :position),
        join: proj in assoc(pos, :project),
        join: ep in assoc(proj, :employer_profile),
        where: ep.user_id == ^user_id,
        preload: [
          :worker_profile,
          position: [project: [employer_profile: :user]]
        ]

    Repo.all(query)
    |> Enum.map(fn app ->
      Map.merge(app, %{
        project_id: app.position.project_id,
        position: app.position
      })
    end)
  end
end
