defmodule Temporah.Contexts.Jobs.Jobs do
  alias Temporah.Repo
  alias Temporah.Schemas.Jobs.Job

  def create_job(attrs) do
    %Job{}
    |> Job.changeset(attrs)
    |> Repo.insert()
  end

  def update_job(job, attrs) do
    job
    |> Job.changeset(attrs)
    |> Repo.update()
  end
end
