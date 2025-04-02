defmodule Tempi.Contexts.Jobs.Jobs do
  alias Tempi.Repo
  alias Tempi.Schemas.Jobs.Job

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
