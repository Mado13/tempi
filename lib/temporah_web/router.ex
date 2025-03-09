defmodule TemporahWeb.Router do
  use TemporahWeb, :router

  pipeline :inertia do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {TemporahWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug Inertia.Plug
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", TemporahWeb.Api do
    pipe_through :api
  end

  scope "/", TemporahWeb do
    pipe_through :inertia

    get "/", PageController, :home
  end
end
