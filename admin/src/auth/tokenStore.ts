const ACCESS_KEY = "evolve.admin.access_token";
const REFRESH_KEY = "evolve.admin.refresh_token";

export function getAccessToken(): string | null {
  return window.sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return window.sessionStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  window.sessionStorage.setItem(ACCESS_KEY, accessToken);
  window.sessionStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  window.sessionStorage.removeItem(ACCESS_KEY);
  window.sessionStorage.removeItem(REFRESH_KEY);
}
