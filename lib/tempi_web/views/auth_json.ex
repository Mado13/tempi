defmodule TempiWeb.AuthJSON do
  def user_with_token(%{user: user, token: token}) do
    %{
      message: "Authentication successful",
      token: token,
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
end
