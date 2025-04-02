defmodule Tempi.Utils.I18n do
  def t(domain, msgid), do: Gettext.dgettext(TempiWeb.Gettext, domain, msgid)
end
