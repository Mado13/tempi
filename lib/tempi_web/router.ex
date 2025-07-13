defmodule TempiWeb.Router do
  use TempiWeb, :router

  import TempiWeb.UserAuth

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :api_auth do
    plug :accepts, ["json"]
    plug TempiWeb.ApiAuth
  end

  scope "/api", TempiWeb do
    pipe_through :api

    # Health check endpoint
    get "/health", HealthController, :index

    # Auth endpoints
    post "/auth/send_code", AuthController, :send_code
    post "/auth/verify_code", AuthController, :verify_code
  end

  scope "/api", TempiWeb do
    pipe_through :api_auth

    # Protected endpoints (require bearer token)
    get "/user/me", UserController, :current_user
    get "/profile", UserController, :profile
    patch "/profile/role", UserController, :update_role
    post "/profile/role", UserController, :create_role
    delete "/auth/logout", AuthController, :logout
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:tempi, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: TempiWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
