defmodule Tempi.Favorites do
  @moduledoc """
  The Favorites context.
  """

  import Ecto.Query, warn: false
  alias Tempi.Repo

  alias Tempi.Job
  alias Tempi.WorkerFavoriteJob
  alias Tempi.Profiles.WorkerProfile

  @doc """
  Toggles the favorite status of a job for a worker.

  If the job is already favorited, it will be unfavorited.
  If it is not favorited, it will be favorited.

  This function operates within a transaction to ensure the job's
  favorites_count is updated correctly.

  ## Parameters
    - job: The `Tempi.Job` struct to favorite/unfavorite.
    - worker_profile: The `Tempi.Profiles.WorkerProfile` struct of the user performing the action.

  ## Returns
    - `{:ok, :favorited, job}` if the job was successfully favorited.
    - `{:ok, :unfavorited, job}` if the job was successfully unfavorited.
    - `{:error, changeset}` if there was a validation error.
    - `{:error, :transaction_failed}` if the database transaction fails.
  """
  def toggle_favorite(%Job{} = job, %WorkerProfile{} = worker_profile) do
    Repo.transaction(fn ->
      existing_favorite = get_favorite(job, worker_profile)

      if existing_favorite do
        unfavorite_job(existing_favorite, job)
      else
        favorite_job(job, worker_profile)
      end
    end)
    |> case do
      {:ok, result} -> result
      {:error, reason} -> {:error, reason}
    end
  end

  defp favorite_job(%Job{} = job, %WorkerProfile{} = worker_profile) do
    # Increment the counter on the job
    job_changeset = Ecto.Changeset.change(job, favorites_count: job.favorites_count + 1)

    # Create the favorite record
    %WorkerFavoriteJob{}
    |> WorkerFavoriteJob.changeset(%{
      job_id: job.id,
      worker_profile_id: worker_profile.id
    })
    |> Repo.insert()
    |> case do
      {:ok, _favorite} ->
        # If the favorite is created successfully, update the job counter
        case Repo.update(job_changeset) do
          {:ok, updated_job} -> {:ok, :favorited, updated_job}
          {:error, _reason} -> Repo.rollback("Failed to update job counter")
        end

      {:error, changeset} ->
        Repo.rollback(changeset)
    end
  end

  defp unfavorite_job(%WorkerFavoriteJob{} = favorite, %Job{} = job) do
    # Decrement the counter on the job
    job_changeset = Ecto.Changeset.change(job, favorites_count: job.favorites_count - 1)

    case Repo.delete(favorite) do
      {:ok, _favorite} ->
        # If the favorite is deleted successfully, update the job counter
        case Repo.update(job_changeset) do
          {:ok, updated_job} -> {:ok, :unfavorited, updated_job}
          {:error, _reason} -> Repo.rollback("Failed to update job counter")
        end

      {:error, changeset} ->
        Repo.rollback(changeset)
    end
  end

  # Helper to find an existing favorite record
  defp get_favorite(%Job{} = job, %WorkerProfile{} = worker_profile) do
    Repo.get_by(WorkerFavoriteJob, job_id: job.id, worker_profile_id: worker_profile.id)
  end
end
