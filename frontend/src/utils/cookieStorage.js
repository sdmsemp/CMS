import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 7, // 7 days
  secure: true, // Only transmitted over HTTPS
  sameSite: 'strict' // Protect against CSRF
};

// Token cookie name
const TOKEN_COOKIE = 'jwt_token';

export const getToken = () => Cookies.get(TOKEN_COOKIE);

export const setToken = (token) => {
  if (token) {
    Cookies.set(TOKEN_COOKIE, token, COOKIE_CONFIG);
  }
};

export const removeToken = () => {
  Cookies.remove(TOKEN_COOKIE);
}; 