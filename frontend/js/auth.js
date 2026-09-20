/**
 * Authentication & State Management Helper
 * Tour & Travel Management System
 */

const Auth = {
  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
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
    this.clearAuth();
    window.location.href = 'login.html';
  },

  requireAuth(redirectUrl = 'login.html') {
    if (!this.isLoggedIn()) {
      window.location.href = `${redirectUrl}?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return false;
    }
    return true;
  },

  requireAdminAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html?admin=true';
      return false;
    }
    if (!this.isAdmin()) {
      alert('Access Denied: Admin privileges required.');
      window.location.href = 'user-dashboard.html';
      return false;
    }
    return true;
  },

  updateNavbar() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    const user = this.getUser();
    const loggedIn = this.isLoggedIn();
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    const isActive = (page) => (currentPath === page ? 'class="active"' : '');

    if (!loggedIn) {
      // Visitor navigation: Home | Tours | Login | Register
      navLinks.innerHTML = `
        <li><a href="index.html" ${isActive('index.html')}>Home</a></li>
        <li><a href="tours.html" ${isActive('tours.html')}>Tours</a></li>
        <li><a href="login.html" ${isActive('login.html')} class="nav-login-btn">Login</a></li>
        <li><a href="register.html" ${isActive('register.html')} class="nav-register-btn">Register</a></li>
      `;
    } else if (user && user.role === 'admin') {
      // Admin navigation: Admin Dashboard | Tours | Bookings | Logout
      navLinks.innerHTML = `
        <li><a href="index.html" ${isActive('index.html')}>Home</a></li>
        <li><a href="tours.html" ${isActive('tours.html')}>Tours</a></li>
        <li><a href="admin.html" ${isActive('admin.html')} class="admin-nav-btn">Admin Dashboard</a></li>
        <li class="user-pill"><span class="badge badge-admin">👑 Admin</span></li>
        <li><button id="nav-logout-btn" class="btn-nav-logout">Logout</button></li>
      `;
    } else {
      // User navigation: Home | Tours | My Bookings | Dashboard | Logout
      navLinks.innerHTML = `
        <li><a href="index.html" ${isActive('index.html')}>Home</a></li>
        <li><a href="tours.html" ${isActive('tours.html')}>Tours</a></li>
        <li><a href="user-dashboard.html" ${isActive('user-dashboard.html')}>My Bookings</a></li>
        <li><a href="user-dashboard.html" class="nav-user-btn">Dashboard</a></li>
        <li class="user-pill"><span class="user-greeting">👤 Hi, ${escapeHtml(user.name.split(' ')[0])}</span></li>
        <li><button id="nav-logout-btn" class="btn-nav-logout">Logout</button></li>
      `;
    }

    const logoutBtn = document.getElementById('nav-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out?')) {
          Auth.logout();
        }
      });
    }
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', () => {
  Auth.updateNavbar();
});
