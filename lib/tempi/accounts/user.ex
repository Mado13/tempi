defmodule Tempi.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @actors [:employer, :worker]

  @derive {Jason.Encoder,
           only: [
             :id,
             :phone_number,
             :current_role,
             :fcm_token,
             :employer_profile,
             :worker_profile,
             :last_dashboard_visit_at,
             :last_active_at
           ]}

  schema "users" do
    field :phone_number, :string
    field :current_role, Ecto.Enum, values: @actors, default: nil
    field :fcm_token, :string
    field :last_dashboard_visit_at, :utc_datetime
    field :last_active_at, :utc_datetime

    has_one :employer_profile, Tempi.Profiles.EmployerProfile
    has_one :worker_profile, Tempi.Profiles.WorkerProfile

    timestamps(type: :utc_datetime)
  end

  @doc """
  A user changeset for basic operations.
  """
  def changeset(user, attrs) do
    changeset =
      user
      |> cast(attrs, [:phone_number, :current_role, :fcm_token])
      |> validate_required([:phone_number])
      |> validate_inclusion(:current_role, @actors,
        message: "INVALID_ROLE",
        validation: :inclusion
      )
      |> validate_and_normalize_phone_number()
      |> unique_constraint(:phone_number, message: "PHONE_ALREADY_EXISTS", validation: :unique)

    # Handle system timestamps after casting
    changeset
    |> maybe_touch_dashboard_visit(attrs)
    |> maybe_touch_last_active(attrs)
  end

  defp maybe_touch_dashboard_visit(changeset, attrs) do
    if Map.get(attrs, "touch_dashboard_visit") do
      put_change(
        changeset,
        :last_dashboard_visit_at,
        DateTime.utc_now() |> DateTime.truncate(:second)
      )
    else
      changeset
    end
  end

  defp maybe_touch_last_active(changeset, attrs) do
    if Map.get(attrs, "touch_last_active") do
      put_change(changeset, :last_active_at, DateTime.utc_now() |> DateTime.truncate(:second))
    else
      changeset
    end
  end

  defp validate_and_normalize_phone_number(changeset) do
    case get_change(changeset, :phone_number) do
      nil ->
        changeset

      phone_number ->
        case ExPhoneNumber.parse(phone_number, "IL") do
          {:ok, parsed} ->
            if ExPhoneNumber.is_valid_number?(parsed) do
              normalized = ExPhoneNumber.format(parsed, :e164)
              put_change(changeset, :phone_number, normalized)
            else
              add_error(changeset, :phone_number, "is not a valid Israeli phone number")
            end

          {:error, _reason} ->
            add_error(changeset, :phone_number, "INVALID_PHONE_FORMAT", validation: :format)
        end
    end
  end
end
