defmodule TempiWeb.UserJSON do
  def current_user(%{user: user}) do
    %{
      user: %{
        id: user.id,
        phone_number: user.phone_number,
        current_role: user.current_role,
        has_worker_profile: !is_nil(user.worker_profile),
        has_employer_profile: !is_nil(user.employer_profile)
      }
    }
  end
end
