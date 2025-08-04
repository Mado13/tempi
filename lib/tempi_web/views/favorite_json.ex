defmodule TempiWeb.FavoriteJSON do
  @doc """
  Renders the JSON response for the toggle action.
  """
  def toggle(%{status: status, project_position: project_position}) do
    %{
      message: "Favorite status updated.",
      # Will be :favorited or :unfavorited
      status: status,
      data: data(project_position)
    }
  end

  # A private helper function to format the project position data
  defp data(project_position) do
    %{
      id: project_position.id,
      title: project_position.title,
      favorites_count: project_position.favorites_count,
      project_id: project_position.project_id
    }
  end
end
