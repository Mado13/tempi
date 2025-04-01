defmodule Temporah.Utils.I18n do
  def t(domain, msgid), do: Gettext.dgettext(TemporahWeb.Gettext, domain, msgid)
end
