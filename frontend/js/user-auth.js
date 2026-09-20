/**
 * User Authentication Helper
 * Tour & Travel Management System
 */

const UserAuth = {
  getToken() {
    return localStorage.getItem('user_token');
  },

  getUser() {
    try {
      const data = localStorage.getItem('user_info');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('user_token', token);
    localStorage.setItem('user_info', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  logout() {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    this.clearSession();
    window.location.href = 'user-login.html';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'user-login.html';
      return false;
    }
    return true;
  },

  updateNavbar() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const loggedIn = this.isLoggedIn();
    const user = this.getUser();
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    const isActive = (path) => (currentPath === path ? 'class="active"' : '');

    if (loggedIn && user) {
      // Logged in user navigation:
      // Home | Explore Tours | My Bookings | Dashboard | Logout | Admin Dashboard
      navLinks.innerHTML = `
        <li><a href="index.html" ${isActive('index.html')}>Home</a></li>
        <li><a href="tours.html" ${isActive('tours.html')}>Explore Tours</a></li>
        <li><a href="user-dashboard.html#my-bookings">My Bookings</a></li>
        <li><a href="user-dashboard.html" ${isActive('user-dashboard.html')}>Dashboard</a></li>
        <li><span style="font-size: 0.85rem; font-weight: 600; color: var(--secondary);">👤 ${escapeUserHtml(user.name.split(' ')[0])}</span></li>
        <li><button id="userLogoutBtn" style="background: transparent; border: 1px solid var(--border); padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">Logout</button></li>
        <li><a href="admin-login.html" class="admin-nav-btn">Admin Dashboard</a></li>
      `;

      const logoutBtn = document.getElementById('userLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          UserAuth.logout();
        });
      }
    } else {
      // Visitor navigation:
      // Home | Explore Tours | Login | Register | Admin Dashboard
      navLinks.innerHTML = `
        <li><a href="index.html" ${isActive('index.html')}>Home</a></li>
        <li><a href="tours.html" ${isActive('tours.html')}>Explore Tours</a></li>
        <li><a href="user-login.html" ${isActive('user-login.html')}>Login</a></li>
        <li><a href="register.html" ${isActive('register.html')}>Register</a></li>
        <li><a href="admin-login.html" class="admin-nav-btn">Admin Dashboard</a></li>
      `;
    }
  }
};

function escapeUserHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', () => {
  UserAuth.updateNavbar();
});
