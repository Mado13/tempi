defmodule TempiWeb.FavoriteJSON do
  @doc """
  Renders the JSON response for the toggle action.
  """
  def toggle(%{status: status, job: job}) do
    %{
      message: "Favorite status updated.",
      # Will be :favorited or :unfavorited
      status: status,
      data: data(job)
    }
  end

  # A private helper function to format the job data,
  # similar to the pattern in your JobsJSON example.
  defp data(job) do
    %{
      id: job.id,
      favorites_count: job.favorites_count
    }
  end
end
