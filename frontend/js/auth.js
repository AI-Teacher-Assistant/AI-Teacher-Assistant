/**
 * auth.js — Token & session management
 * Member 1: Frontend (Sunaina)
 */

const TOKEN_KEY = 'ata_token';
const USER_KEY  = 'ata_user';

export const auth = {
  /** Save JWT and user object after login/register */
  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /** Get saved JWT */
  getToken() { return localStorage.getItem(TOKEN_KEY); },

  /** Get saved user object */
  getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  },

  /** Update stored user (e.g. after trial count changes) */
  updateUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /** Clear session and redirect to login */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/frontend/index.html';
  },

  /** True if a token exists (optimistic — backend still validates) */
  isLoggedIn() { return !!this.getToken(); },

  /**
   * Guard: call at top of protected pages.
   * Redirects to login if not authenticated.
   */
  require() {
    if (!this.isLoggedIn()) {
      window.location.href = '/frontend/index.html';
    }
  },

  /** Get initials for avatar */
  getInitials() {
    const u = this.getUser();
    if (!u || !u.name) return '?';
    return u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  },
};
