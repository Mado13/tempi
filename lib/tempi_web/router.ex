defmodule TempiWeb.Router do
  use TempiWeb, :router

  import TempiWeb.UserAuth
  import TempiWeb.RolePlugs
  import TempiWeb.PwaPlugs

  pipeline :inertia do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug TempiWeb.SetLocale
    plug :put_root_layout, html: {TempiWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_user
    plug Inertia.Plug
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", TempiWeb.Api do
    pipe_through :api
  end

  scope "/", TempiWeb do
    pipe_through [:inertia]
  end

  scope "/", TempiWeb do
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

  scope "/worker", TempiWeb do
    pipe_through [:inertia, :require_authenticated_user, :require_worker_role]

    # get "/agenda", Worker.AgendaController, :index
  end

  scope "/employer", TempiWeb do
    pipe_through [:inertia, :require_authenticated_user, :require_employer_role]

    get "/agenda", Employer.AgendaController, :index
    resources "/jobs", Employer.JobsController, only: [:create, :new, :index]
  end

  scope "/", TempiWeb do
    pipe_through [:inertia, :require_authenticated_user, :redirect_root_based_on_role]

    post "/toggle-role", AuthController, :toggle_role

    get "/choose-role", AuthController, :role_form
    post "/choose-role", AuthController, :set_role

    # get "/", PageController, :home
  end
end
