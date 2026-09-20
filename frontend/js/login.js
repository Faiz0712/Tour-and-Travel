/**
 * Login Logic
 * Tour & Travel Management System
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect appropriately
  if (Auth.isLoggedIn()) {
    if (Auth.isAdmin()) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'user-dashboard.html';
    }
    return;
  }

  const tabUserBtn = document.getElementById('tab-user-btn');
  const tabAdminBtn = document.getElementById('tab-admin-btn');
  const loginTitle = document.getElementById('login-title');
  const loginSubtitle = document.getElementById('login-subtitle');
  const loginIcon = document.getElementById('login-icon');
  const form = document.getElementById('login-form');
  const alertBox = document.getElementById('alert-box');
  const submitBtn = document.getElementById('login-btn');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const fillUserBtn = document.getElementById('fill-user-btn');
  const fillAdminBtn = document.getElementById('fill-admin-btn');

  let currentMode = 'user'; // 'user' or 'admin'

  // URL Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === 'true') {
    showAlert('Account created successfully! Please sign in.', 'success');
  }
  if (urlParams.get('admin') === 'true') {
    switchMode('admin');
  }

  function showAlert(message, type = 'error') {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
  }

  function clearAlert() {
    alertBox.className = 'alert d-none';
    alertBox.textContent = '';
  }

  function switchMode(mode) {
    currentMode = mode;
    clearAlert();

    if (mode === 'admin') {
      tabAdminBtn.classList.add('active');
      tabUserBtn.classList.remove('active');
      loginTitle.textContent = 'Administrator Portal';
      loginSubtitle.textContent = 'Secure management access for system administrators';
      loginIcon.textContent = '👑';
      submitBtn.textContent = 'Sign In as Administrator';
    } else {
      tabUserBtn.classList.add('active');
      tabAdminBtn.classList.remove('active');
      loginTitle.textContent = 'Sign In to Your Account';
      loginSubtitle.textContent = 'Access your bookings and plan your dream journeys';
      loginIcon.textContent = '🔑';
      submitBtn.textContent = 'Sign In';
    }
  }

  tabUserBtn.addEventListener('click', () => switchMode('user'));
  tabAdminBtn.addEventListener('click', () => switchMode('admin'));

  // Quick fill buttons for testing/viva
  fillUserBtn.addEventListener('click', () => {
    switchMode('user');
    emailInput.value = 'rahul@gmail.com';
    passwordInput.value = 'User@123';
  });

  fillAdminBtn.addEventListener('click', () => {
    switchMode('admin');
    emailInput.value = 'admin@tourtravel.com';
    passwordInput.value = 'Admin@123';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showAlert('Please enter both email and password.', 'error');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Enforce Admin Tab Access Control
        if (currentMode === 'admin' && data.user.role !== 'admin') {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In as Administrator';
          showAlert('Access Denied (403): This account does not have administrator privileges.', 'error');
          return;
        }

        // Save session
        Auth.setAuth(data.token, data.user);
        showAlert(`Welcome back, ${data.user.name}! Redirecting...`, 'success');

        // Redirect logic
        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            const redirect = urlParams.get('redirect');
            if (redirect && !redirect.includes('login') && !redirect.includes('register')) {
              window.location.href = redirect;
            } else {
              window.location.href = 'user-dashboard.html';
            }
          }
        }, 800);
      } else {
        showAlert(data.message || 'Invalid email or password.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = currentMode === 'admin' ? 'Sign In as Administrator' : 'Sign In';
      }
    } catch (err) {
      console.error('Login error:', err);
      showAlert('Network error. Failed to connect to server.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = currentMode === 'admin' ? 'Sign In as Administrator' : 'Sign In';
    }
  });
});
