defmodule TemporahWeb.SetLocale do
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
        |> Enum.sort(fn {_, quality1}, {_, quality2} -> quality1 > quality2 end)
        |> Enum.find_value(nil, fn {locale, _} ->
          short_locale = String.slice(locale, 0, 2)

          if short_locale in @supported_locales do
            short_locale
          else
            nil
          end
        end)

      _ ->
        nil
    end
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
