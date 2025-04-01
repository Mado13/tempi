defmodule TemporahWeb.Router do
  use TemporahWeb, :router

  import TemporahWeb.UserAuth
  import TemporahWeb.RolePlugs
  import TemporahWeb.PwaPlugs

  pipeline :inertia do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug TemporahWeb.SetLocale
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
    pipe_through [:inertia, :redirect_if_user_is_authenticated]

    # Register
    get "/register", AuthController, :register_form
    get "/register/verify", AuthController, :register_verify_form
    post "/register/request", AuthController, :request_register_code
    post "/register/verify", AuthController, :verify_register_code

    # Login
    get "/login", AuthController, :login_form
    get "/login/verify", AuthController, :login_verify_form
    post "/login/request", AuthController, :request_login_code
    post "/login/verify", AuthController, :verify_login_code
  end

  scope "/worker", TemporahWeb do
    pipe_through [:inertia, :require_authenticated_user, :require_worker_role]

    get "/dashboard", WorkerDashboardController, :index
    get "/agenda", Worker.AgendaController, :index
  end

  scope "/employer", TemporahWeb do
    pipe_through [:inertia, :require_authenticated_user, :require_employer_role]

    get "/dashboard", EmployerDashboardController, :index
  end

  # Common authenticated routes
  scope "/", TemporahWeb do
    pipe_through [:inertia, :require_authenticated_user, :redirect_root_based_on_role]

    get "/choose-role", AuthController, :role_form
    post "/choose-role", AuthController, :set_role

    get "/", PageController, :home
  end

  scope "/", TemporahWeb do
    pipe_through [:inertia, :require_authenticated_user]

    get "/users/settings", UserSettingsController, :edit
    put "/users/settings", UserSettingsController, :update
    get "/users/settings/confirm_email/:token", UserSettingsController, :confirm_email
  end

  scope "/", TemporahWeb do
    pipe_through [:inertia]
  end
end
