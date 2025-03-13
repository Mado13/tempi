defmodule TemporahWeb.Router do
  use TemporahWeb, :router

  import TemporahWeb.UserAuth
  import TemporahWeb.RolePlugs
  import TemporahWeb.PwaPlugs

  pipeline :inertia do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {TemporahWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_user
    plug Inertia.Plug
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", TemporahWeb.Api do
    pipe_through :api
  end

  scope "/", TemporahWeb do
    pipe_through [:inertia]

    get "/splash", WelcomeController, :index
    get "/install", PageController, :install
  end

  ## Authentication routes

  scope "/", TemporahWeb do
    pipe_through [:inertia, :require_pwa, :redirect_if_user_is_authenticated]

    get "/users/register", UserRegistrationController, :new
    post "/users/register", UserRegistrationController, :create
    get "/users/log_in", UserSessionController, :new
    post "/users/log_in", UserSessionController, :create
    get "/users/reset_password", UserResetPasswordController, :new
    post "/users/reset_password", UserResetPasswordController, :create
    get "/users/reset_password/:token", UserResetPasswordController, :edit
    put "/users/reset_password/:token", UserResetPasswordController, :update
  end

  scope "/employee", TemporahWeb do
    pipe_through [:inertia, :require_pwa, :require_authenticated_user, :require_employee_role]

    get "/dashboard", EmployeeDashboardController, :index
  end

  scope "/employer", TemporahWeb do
    pipe_through [:inertia, :require_pwa, :require_authenticated_user, :require_employer_role]

    get "/dashboard", EmployerDashboardController, :index
  end

  # Common authenticated routes
  scope "/", TemporahWeb do
    pipe_through [:inertia, :require_pwa, :require_authenticated_user]

    get "/", PageController, :home
  end

  scope "/", TemporahWeb do
    pipe_through [:inertia, :require_pwa, :require_authenticated_user]

    get "/users/settings", UserSettingsController, :edit
    put "/users/settings", UserSettingsController, :update
    get "/users/settings/confirm_email/:token", UserSettingsController, :confirm_email
  end

  scope "/", TemporahWeb do
    pipe_through [:inertia]

    delete "/users/log_out", UserSessionController, :delete
    get "/users/confirm", UserConfirmationController, :new
    post "/users/confirm", UserConfirmationController, :create
    get "/users/confirm/:token", UserConfirmationController, :edit
    post "/users/confirm/:token", UserConfirmationController, :update
  end
end
