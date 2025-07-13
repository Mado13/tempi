import { Preferences } from "@capacitor/preferences";

class AuthService {
  isAuthenticated = $state(false);

  async checkAuth() {
    try {
      const { value: token } = await Preferences.get({ key: "auth_token" });
      const { value: expiresAt } = await Preferences.get({key: "token_expires_at"});

      if (!token || !expiresAt) {
        this.isAuthenticated = false;
        return false;
      }

      const now = new Date().getTime();
      const expiry = parseInt(expiresAt);

      if (now > expiry) {
        await this.logout();
        return false;
      }

      this.isAuthenticated = true;
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      this.isAuthenticated = false;
      return false;
    }
  }

  async login(token) {
    const expiresAt = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;

    await Preferences.set({ key: "auth_token", value: token });
    await Preferences.set({key: "token_expires_at", value: expiresAt.toString()});

    this.isAuthenticated = true;
  }

  async logout() {
    await Preferences.remove({ key: "auth_token" });
    await Preferences.remove({ key: "token_expires_at" });
    this.isAuthenticated = false;
  }
}

export const authService = new AuthService();
