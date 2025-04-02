defmodule Temporah.Contexts.Jobs.JobAgreement do
  alias Temporah.Repo
  alias Temporah.Schemas.Jobs.JobAgreement

  def create_job_agreement(attrs) do
    %JobAgreement{}
    |> JobAgreement.changeset(attrs)
    |> Repo.insert()
  end
end
