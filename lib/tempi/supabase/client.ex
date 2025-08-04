# lib/tempi/supabase/client.ex
defmodule Tempi.Supabase.Client do
  @doc "Generate JWT for authenticated user"
  def generate_jwt(user_id) do
    secret = Application.get_env(:tempi, :supabase_jwt_secret)

    if is_nil(secret) do
      {:error, "JWT secret not configured"}
    else
      header = %{"alg" => "HS256", "typ" => "JWT"}

      claims = %{
        "aud" => "authenticated",
        "exp" => System.system_time(:second) + 3600,
        "iat" => System.system_time(:second),
        "iss" => "supabase",
        "sub" => user_id,
        "email" => "",
        "phone" => "",
        "app_metadata" => %{
          "provider" => "custom",
          "providers" => ["custom"]
        },
        "user_metadata" => %{},
        "role" => "authenticated",
        "aal" => "aal1",
        "amr" => [%{"method" => "password", "timestamp" => System.system_time(:second)}],
        "session_id" => user_id
      }

      try do
        jwt = JOSE.JWT.sign(JOSE.JWK.from_oct(secret), header, claims)
        {_, token} = JOSE.JWS.compact(jwt)
        {:ok, token}
      rescue
        error -> {:error, error}
      end
    end
  end
end
