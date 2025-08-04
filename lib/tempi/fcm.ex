defmodule Tempi.FCM do
  use Pigeon.Dispatcher, otp_app: :tempi
  alias Pigeon.FCM.Notification
  alias Tempi.Repo

  @type notification_opts :: %{
          type: String.t(),
          title: String.t(),
          body: String.t(),
          url: String.t() | nil,
          data: map()
        }

  def notify(user_or_id, opts)

  def notify(%{fcm_token: token} = _user, opts) when not is_nil(token) do
    send_push_notification(token, opts)
  end

  def notify(user_id, opts) when is_binary(user_id) do
    case Repo.get(Tempi.Accounts.User, user_id) do
      %{fcm_token: token} when not is_nil(token) ->
        send_push_notification(token, opts)

      _ ->
        :ok
    end
  end

  def notify(_, _), do: :ok

  defp send_push_notification(token, %{type: type, title: title, body: body} = opts) do
    # Build data payload for client dispatcher
    base_data = %{
      "type" => type,
      "url" => Map.get(opts, :url)
    }

    # Merge with additional data and remove nil values
    data =
      base_data
      |> Map.merge(Map.get(opts, :data, %{}))
      |> Enum.reject(fn {_k, v} -> is_nil(v) end)
      |> Map.new()

    notification =
      Notification.new(
        {:token, token},
        %{"title" => title, "body" => body},
        data
      )

    push(notification)
  end
end
