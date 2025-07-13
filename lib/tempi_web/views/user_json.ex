defmodule TempiWeb.UserJSON do
  def current_user(%{user: user}) do
    %{
      user: %{
        id: user.id,
        phone_number: user.phone_number,
        current_role: user.current_role,
        worker_profile: render_profile(user.worker_profile),
        employer_profile: render_profile(user.employer_profile)
      }
    }
  end

  defp render_profile(nil), do: nil
  # Add this line
  defp render_profile(%Ecto.Association.NotLoaded{}), do: nil
  defp render_profile(profile), do: %{id: profile.id}
end
