defmodule TempiWeb do
  @moduledoc """
  The entrypoint for defining your web interface, such
  as controllers, components, channels, and so on.

  This can be used in your application as:

      use TempiWeb, :controller
      use TempiWeb, :html

  The definitions below will be executed for every controller,
  component, etc, so keep them short and clean, focused
  on imports, uses and aliases.

  Do NOT define functions inside the quoted expressions
  below. Instead, define additional modules and import
  those modules here.
  """

  def static_paths do
    # Base static paths
    base_paths =
      ~w(assets icons fonts images favicon.ico robots.txt sw.js manifest.webmanifest registerSW.js)

    # Find workbox files dynamically
    workbox_files =
      File.ls!("priv/static")
      |> Enum.filter(fn file ->
        String.match?(file, ~r/^workbox-.*\.js$/) ||
          String.match?(file, ~r/^workbox-.*\.js\.map$/) ||
          file == "sw.js.map"
      end)

    base_paths ++ workbox_files
  end

  def router do
    quote do
      use Phoenix.Router, helpers: false

      # Import common connection and controller functions to use in pipelines
      import Plug.Conn
      import Phoenix.Controller
      import Phoenix.LiveView.Router
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
    end
  end

  def controller do
    quote do
      use Phoenix.Controller,
        formats: [:html, :json],
        layouts: [html: TempiWeb.Layouts]

      use Gettext, backend: TempiWeb.Gettext

      import Plug.Conn

      unquote(verified_routes())
      import Inertia.Controller
    end
  end

  def live_view do
    quote do
      use Phoenix.LiveView,
        layout: {TempiWeb.Layouts, :app}

      unquote(html_helpers())
    end
  end

  def live_component do
    quote do
      use Phoenix.LiveComponent

      unquote(html_helpers())
    end
  end

  def html do
    quote do
      use Phoenix.Component

      # Import convenience functions from controllers
      import Phoenix.Controller,
        only: [get_csrf_token: 0, view_module: 1, view_template: 1]

      # Include general helpers for rendering HTML
      unquote(html_helpers())
      import Inertia.HTML
    end
  end

  defp html_helpers do
    quote do
      # Translation
      use Gettext, backend: TempiWeb.Gettext

      # HTML escaping functionality
      import Phoenix.HTML
      # Core UI components
      import TempiWeb.CoreComponents

      # Shortcut for generating JS commands
      alias Phoenix.LiveView.JS

      # Routes generation with the ~p sigil
      unquote(verified_routes())
    end
  end

  def verified_routes do
    quote do
      use Phoenix.VerifiedRoutes,
        endpoint: TempiWeb.Endpoint,
        router: TempiWeb.Router,
        statics: TempiWeb.static_paths()
    end
  end

  @doc """
  When used, dispatch to the appropriate controller/live_view/etc.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
