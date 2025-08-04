defmodule TempiWeb.UserJSON do
  def show(%{worker_profile: profile}) do
    %{data: [worker_profile_data(profile)]}
  end

  def current_user(%{user: user}) do
    %{
      user: %{
        id: user.id,
        phone_number: user.phone_number,
        current_role: user.current_role,
        has_worker_profile: !is_nil(user.worker_profile),
        has_employer_profile: !is_nil(user.employer_profile),
        last_active_at: user.last_active_at,
        last_dashboard_visit_at: user.last_dashboard_visit_at
      }
    }
  end

  defp worker_profile_data(profile) do
    %{
      id: profile.id,
      full_name: profile.full_name,
      skills: profile.skills,
      experience_years: profile.experience_years,
      bio: profile.bio,
      hourly_rate: profile.hourly_rate,
      availability: profile.availability
    }
  end
end
