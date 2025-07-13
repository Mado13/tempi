defmodule Tempi.Accounts.UserToken do
  use Ecto.Schema
  import Ecto.Query
  alias Tempi.Accounts.UserToken

  @hash_algorithm :sha256
  @rand_size 32
  @api_token_validity_in_days 365

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "users_tokens" do
    field :token, :binary
    field :context, :string
    field :sent_to, :string
    belongs_to :user, Tempi.Accounts.User

    timestamps(type: :utc_datetime, updated_at: false)
  end

  @doc """
  Builds an API token for bearer authentication.
  """
  def build_api_token(user) do
    build_hashed_token(user, "api-token", user.phone_number)
  end

  defp build_hashed_token(user, context, sent_to) do
    token = :crypto.strong_rand_bytes(@rand_size)
    hashed_token = :crypto.hash(@hash_algorithm, token)

    {Base.url_encode64(token, padding: false),
     %UserToken{
       token: hashed_token,
       context: context,
       sent_to: sent_to,
       user_id: user.id
     }}
  end

  @doc """
  Checks if the API token is valid and returns its underlying lookup query.
  """
  def verify_api_token_query(token) do
    case Base.url_decode64(token, padding: false) do
      {:ok, decoded_token} ->
        hashed_token = :crypto.hash(@hash_algorithm, decoded_token)

        query =
          from token in by_token_and_context_query(hashed_token, "api-token"),
            join: user in assoc(token, :user),
            where:
              token.inserted_at > ago(@api_token_validity_in_days, "day") and
                token.sent_to == user.phone_number,
            select: user

        {:ok, query}

      :error ->
        :error
    end
  end

  @doc """
  Returns the token struct for the given token value and context.
  """
  def by_token_and_context_query(token, context) do
    from UserToken, where: [token: ^token, context: ^context]
  end

  @doc """
  Gets all tokens for the given user.
  """
  def by_user_query(user) do
    from t in UserToken, where: t.user_id == ^user.id
  end
end
