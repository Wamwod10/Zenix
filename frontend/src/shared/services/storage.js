// ✅ BACKEND INTEGRATION: JWT tokenlarni saqlash
// Access token 15 daqiqa, refresh token 30 kun amal qiladi

const ACCESS_KEY = "zenix_access_token";
const REFRESH_KEY = "zenix_refresh_token";
const USER_KEY = "zenix_user";

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),

  getUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  save: ({ tokens, user }) => {
    if (tokens?.accessToken) localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    if (tokens?.refreshToken)
      localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
