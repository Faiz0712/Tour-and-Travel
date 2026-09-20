/**
 * Registration Logic
 * Tour & Travel Management System
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect
  if (Auth.isLoggedIn()) {
    if (Auth.isAdmin()) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'user-dashboard.html';
    }
    return;
  }

  const form = document.getElementById('register-form');
  const alertBox = document.getElementById('alert-box');
  const submitBtn = document.getElementById('register-btn');

  function showAlert(message, type = 'error') {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearAlert() {
    alertBox.className = 'alert d-none';
    alertBox.textContent = '';
  }

  function clearFieldErrors() {
    document.querySelectorAll('.error-text').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group input').forEach(el => el.classList.remove('input-error'));
  }

  function setFieldError(fieldId, errorMsg) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = errorMsg;
    if (inputEl) inputEl.classList.add('input-error');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();
    clearFieldErrors();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let hasErrors = false;

    // Validate name
    if (!name) {
      setFieldError('name', 'Full name is required.');
      hasErrors = true;
    } else if (name.length < 2) {
      setFieldError('name', 'Name must be at least 2 characters.');
      hasErrors = true;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setFieldError('email', 'Email address is required.');
      hasErrors = true;
    } else if (!emailRegex.test(email)) {
      setFieldError('email', 'Please enter a valid email address.');
      hasErrors = true;
    }

    // Validate phone
    const phoneRegex = /^[0-9+\-\s]{7,15}$/;
    if (!phone) {
      setFieldError('phone', 'Phone number is required.');
      hasErrors = true;
    } else if (!phoneRegex.test(phone)) {
      setFieldError('phone', 'Please enter a valid phone number (at least 7 digits).');
      hasErrors = true;
    }

    // Validate password
    if (!password) {
      setFieldError('password', 'Password is required.');
      hasErrors = true;
    } else if (password.length < 6) {
      setFieldError('password', 'Password must be at least 6 characters long.');
      hasErrors = true;
    }

    // Validate confirmPassword
    if (!confirmPassword) {
      setFieldError('confirmPassword', 'Please confirm your password.');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setFieldError('confirmPassword', 'Passwords do not match.');
      hasErrors = true;
    }

    if (hasErrors) {
      showAlert('Please correct the highlighted errors before proceeding.', 'error');
      return;
    }

    // Submit via REST API
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registering account...';

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, confirmPassword })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert('Registration successful! Redirecting to login...', 'success');
        form.reset();
        setTimeout(() => {
          window.location.href = 'login.html?registered=true';
        }, 1500);
      } else {
        showAlert(data.message || 'Registration failed. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register Account';
      }
    } catch (err) {
      console.error('Registration network error:', err);
      showAlert('Network error. Make sure the backend server is running.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register Account';
    }
  });
});
