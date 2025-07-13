defmodule Tempi.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @derive {Jason.Encoder,
           only: [
             :id,
             :phone_number,
             :current_role,
             :employer_profile,
             :worker_profile,
             :inserted_at
           ]}

  schema "users" do
    field :phone_number, :string
    field :current_role, Ecto.Enum, values: [:employer, :worker], default: nil

    has_one :employer_profile, Tempi.Profiles.EmployerProfile
    has_one :worker_profile, Tempi.Profiles.WorkerProfile

    timestamps(type: :utc_datetime)
  end

  @doc """
  A user changeset for basic operations.
  """
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:phone_number, :current_role])
    |> validate_required([:phone_number])
    |> validate_inclusion(:current_role, [:employer, :worker],
      message: "INVALID_ROLE",
      validation: :inclusion
    )
    |> validate_and_normalize_phone_number()
    |> unique_constraint(:phone_number, message: "PHONE_ALREADY_EXISTS", validation: :unique)
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
