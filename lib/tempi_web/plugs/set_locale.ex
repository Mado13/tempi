defmodule TempiWeb.SetLocale do
  import Plug.Conn
  require Logger

  @supported_locales ["en", "he"]
  @default_locale "en"

  def init(opts) do
    opts
  end

  def call(conn, _opts) do
    locale =
      extract_accept_language(conn) ||
        conn.params["locale"] ||
        get_session(conn, :locale) ||
        @default_locale

    locale =
      if locale in @supported_locales do
        locale
      else
        @default_locale
      end

    direction = get_direction(locale)

    conn
    |> put_session(:locale, locale)
    |> assign(:locale, locale)
    |> assign(:direction, direction)
  end

  defp extract_accept_language(conn) do
    case get_req_header(conn, "accept-language") do
      [accept_language | _] ->
        accept_language
        |> String.split(",")
        |> Enum.map(&parse_language_option/1)
        |> Enum.sort(fn {_, q1}, {_, q2} -> q1 > q2 end)
        |> Enum.find_value(nil, &preferred_supported_locale/1)

      _ ->
        nil
    end
  end

  defp preferred_supported_locale({locale, _}) do
    short = String.slice(locale, 0, 2)
    if short in @supported_locales, do: short, else: nil
  end

  defp parse_language_option(option) do
    case String.split(option, ";q=") do
      [language, quality] -> {String.trim(language), Float.parse(quality) |> elem(0)}
      [language] -> {String.trim(language), 1.0}
    end
  end

  defp get_direction("he") do
    "rtl"
  end

  defp get_direction(_) do
    "ltr"
  end
end
