defmodule Tempi.Favorites do
  @moduledoc """
  The Favorites context.
  """
  import Ecto.Query, warn: false
  alias Tempi.Repo
  alias Tempi.ProjectPosition
  alias Tempi.WorkerFavoriteProjectPosition
  alias Tempi.Profiles.WorkerProfile

  @doc """
  Toggles the favorite status of a project position for a worker.
  If the position is already favorited, it will be unfavorited.
  If it is not favorited, it will be favorited.

  This function operates within a transaction to ensure the position's
  favorites_count is updated correctly.

  ## Parameters
    - project_position: The `Tempi.ProjectPosition` struct to favorite/unfavorite.
    - worker_profile: The `Tempi.Profiles.WorkerProfile` struct of the user performing the action.

  ## Returns
    - `{:ok, :favorited, project_position}` if the position was successfully favorited.
    - `{:ok, :unfavorited, project_position}` if the position was successfully unfavorited.
    - `{:error, changeset}` if there was a validation error.
    - `{:error, :transaction_failed}` if the database transaction fails.
  """
  def toggle_favorite(%ProjectPosition{} = project_position, %WorkerProfile{} = worker_profile) do
    Repo.transaction(fn ->
      existing_favorite = get_favorite(project_position, worker_profile)

      if existing_favorite do
        unfavorite_position(existing_favorite, project_position)
      else
        favorite_position(project_position, worker_profile)
      end
    end)
    |> case do
      {:ok, result} -> result
      {:error, reason} -> {:error, reason}
    end
  end

  defp favorite_position(%ProjectPosition{} = position, %WorkerProfile{} = worker_profile) do
    # Increment the counter on the position
    position_changeset =
      Ecto.Changeset.change(position, favorites_count: position.favorites_count + 1)

    # Create the favorite record
    %WorkerFavoriteProjectPosition{}
    |> WorkerFavoriteProjectPosition.changeset(%{
      project_position_id: position.id,
      worker_profile_id: worker_profile.id
    })
    |> Repo.insert()
    |> case do
      {:ok, _favorite} ->
        # If the favorite is created successfully, update the position counter
        case Repo.update(position_changeset) do
          {:ok, updated_position} -> {:ok, :favorited, updated_position}
          {:error, _reason} -> Repo.rollback("Failed to update position counter")
        end

      {:error, changeset} ->
        Repo.rollback(changeset)
    end
  end

  defp unfavorite_position(
         %WorkerFavoriteProjectPosition{} = favorite,
         %ProjectPosition{} = position
       ) do
    # Decrement the counter on the position
    position_changeset =
      Ecto.Changeset.change(position, favorites_count: position.favorites_count - 1)

    case Repo.delete(favorite) do
      {:ok, _favorite} ->
        # If the favorite is deleted successfully, update the position counter
        case Repo.update(position_changeset) do
          {:ok, updated_position} -> {:ok, :unfavorited, updated_position}
          {:error, _reason} -> Repo.rollback("Failed to update position counter")
        end

      {:error, changeset} ->
        Repo.rollback(changeset)
    end
  end

  # Helper to find an existing favorite record
  defp get_favorite(%ProjectPosition{} = position, %WorkerProfile{} = worker_profile) do
    Repo.get_by(WorkerFavoriteProjectPosition,
      project_position_id: position.id,
      worker_profile_id: worker_profile.id
    )
  end
end
