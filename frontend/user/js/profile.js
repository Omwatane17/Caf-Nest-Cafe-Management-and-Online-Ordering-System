/**
 * CaféNest - Profile / Account Page Script
 * Manages demo profile state, localStorage persistence, form validation, edit mode, and panel tabs.
 */

const STORAGE_USER_KEY = 'cafenest_user';

// State container
let currentUser = null;
let isEditMode = false;

/**
 * Resolves the active user record: loads from localStorage or seeds from USERS_DATA
 * @returns {Object} User record
 */
function getInitialUser() {
  const seed = (typeof USERS_DATA !== 'undefined' && USERS_DATA.length > 0)
    ? USERS_DATA[0]
    : {
        id: 'user-001',
        name: 'CafeNest User',
        phone: '+91 98765 43210',
        email: 'tejaswini@email.com',
        address: 'Amravati, Maharashtra',
        avatar: null
      };

  try {
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that essential keys exist
      if (parsed && parsed.name && parsed.email) {
        if (parsed.name === 'Tejaswini Sonone') {
          parsed.name = 'CafeNest User';
          persistUser(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read user profile from localStorage:', err);
  }

  // Fallback to seed data
  return { ...seed };
}

/**
 * Saves current user record to localStorage
 * @param {Object} user 
 */
function persistUser(user) {
  try {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Could not save user profile to localStorage:', err);
  }
}

/**
 * Updates DOM elements with the current user state
 */
function renderUserProfile() {
  if (!currentUser) return;

  // 1. Profile Summary Row (Name & Meta info line)
  const displayName = document.getElementById('profile-display-name');
  const displayMeta = document.getElementById('profile-display-meta');
  
  if (displayName) displayName.textContent = currentUser.name;
  if (displayMeta) displayMeta.textContent = `${currentUser.email} • ${currentUser.phone}`;

  // 2. Input Fields
  const nameInput = document.getElementById('input-name');
  const phoneInput = document.getElementById('input-phone');
  const emailInput = document.getElementById('input-email');
  const addressInput = document.getElementById('input-address');

  if (nameInput) nameInput.value = currentUser.name;
  if (phoneInput) phoneInput.value = currentUser.phone;
  if (emailInput) emailInput.value = currentUser.email;
  if (addressInput) addressInput.value = currentUser.address;
}

/**
 * Clears all inline error states and descriptions
 */
function clearAllErrors() {
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
  });

  const errorMessages = document.querySelectorAll('.inline-error');
  errorMessages.forEach(msg => {
    msg.textContent = '';
    msg.classList.remove('visible');
  });
}

/**
 * Shows an inline error message for a specific input field
 * @param {string} fieldId 
 * @param {string} errorId 
 * @param {string} message 
 */
function setFieldError(fieldId, errorId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(errorId);

  if (input) {
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
  }

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

/**
 * Toggles edit mode for the profile form
 * @param {boolean} editState 
 */
function setEditMode(editState) {
  isEditMode = editState;

  const btnEdit = document.getElementById('btn-edit-profile');
  const editActions = document.getElementById('edit-mode-actions');
  const inputs = [
    document.getElementById('input-name'),
    document.getElementById('input-phone'),
    document.getElementById('input-email'),
    document.getElementById('input-address')
  ];

  if (isEditMode) {
    // Switch to editing state
    if (btnEdit) btnEdit.hidden = true;
    if (editActions) editActions.hidden = false;

    inputs.forEach(input => {
      if (input) {
        input.readOnly = false;
        input.setAttribute('aria-readonly', 'false');
        input.classList.add('editable');
      }
    });

    // Move focus to the first field (Name)
    const nameInput = document.getElementById('input-name');
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  } else {
    // Switch back to read-only state
    if (btnEdit) btnEdit.hidden = false;
    if (editActions) editActions.hidden = true;

    inputs.forEach(input => {
      if (input) {
        input.readOnly = true;
        input.setAttribute('aria-readonly', 'true');
        input.classList.remove('editable');
      }
    });

    clearAllErrors();
  }
}

/**
 * Validates an Indian mobile number.
 * Accepts 10 digits with optional +91 or 91 prefix.
 * @param {string} raw 
 * @returns {string|null} 10-digit number string or null if invalid
 */
function parseIndianMobile(raw) {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/[\s\-()]/g, '');
  const match = cleaned.match(/^(?:\+91|91)?([6-9]\d{9})$/);
  if (match) {
    return match[1];
  }
  // Also accept standard 10 numeric digits if entered
  const genericMatch = cleaned.match(/^(?:\+91|91)?(\d{10})$/);
  return genericMatch ? genericMatch[1] : null;
}

/**
 * Formats a 10-digit mobile number as "+91 XXXXX XXXXX"
 * @param {string} digits10 
 * @returns {string}
 */
function formatIndianMobile(digits10) {
  return `+91 ${digits10.slice(0, 5)} ${digits10.slice(5)}`;
}

/**
 * Basic RFC 5322 compatible email format check
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates form fields and updates profile if all pass
 * @param {Event} e 
 */
function handleSaveProfile(e) {
  if (e) e.preventDefault();

  clearAllErrors();

  const nameInput = document.getElementById('input-name');
  const phoneInput = document.getElementById('input-phone');
  const emailInput = document.getElementById('input-email');
  const addressInput = document.getElementById('input-address');

  const nameVal = nameInput ? nameInput.value.trim() : '';
  const phoneVal = phoneInput ? phoneInput.value.trim() : '';
  const emailVal = emailInput ? emailInput.value.trim() : '';
  const addressVal = addressInput ? addressInput.value.trim() : '';

  let isValid = true;
  let firstInvalidEl = null;

  // 1. Name validation: required, at least 2 characters
  if (!nameVal || nameVal.length < 2) {
    setFieldError('input-name', 'error-name', 'Please enter your full name (at least 2 characters).');
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = nameInput;
  }

  // 2. Phone validation: 10-digit Indian mobile, optional +91 prefix
  const parsedDigits = parseIndianMobile(phoneVal);
  if (!phoneVal) {
    setFieldError('input-phone', 'error-phone', 'Phone number is required.');
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = phoneInput;
  } else if (!parsedDigits) {
    setFieldError('input-phone', 'error-phone', 'Please enter a valid 10-digit Indian phone number (e.g. +91 98765 43210).');
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = phoneInput;
  }

  // 3. Email validation: valid email format
  if (!emailVal) {
    setFieldError('input-email', 'error-email', 'Email address is required.');
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = emailInput;
  } else if (!isValidEmail(emailVal)) {
    setFieldError('input-email', 'error-email', 'Please enter a valid email address (e.g. name@example.com).');
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = emailInput;
  }

  // 4. Address validation: required
  if (!addressVal) {
    setFieldError('input-address', 'error-address', 'Address is required.');
    isValid = false;
    if (!firstInvalidEl) firstInvalidEl = addressInput;
  }

  // If any errors exist, focus the first problematic input and stop
  if (!isValid) {
    if (firstInvalidEl) firstInvalidEl.focus();
    return;
  }

  // Format phone number to standard "+91 XXXXX XXXXX"
  const formattedPhone = formatIndianMobile(parsedDigits);

  // Update current user state
  currentUser = {
    ...currentUser,
    name: nameVal,
    phone: formattedPhone,
    email: emailVal,
    address: addressVal
  };

  // Persist to localStorage
  persistUser(currentUser);

  // Re-render UI and exit edit mode
  renderUserProfile();
  setEditMode(false);

  // Provide user feedback via toast
  if (typeof showToast === 'function') {
    showToast('Profile updated (demo)');
  }
}

/**
 * Cancels editing mode and restores original values
 */
function handleCancelEdit() {
  renderUserProfile();
  setEditMode(false);
  const btnEdit = document.getElementById('btn-edit-profile');
  if (btnEdit) btnEdit.focus();
}

/**
 * Resets demo user profile back to seed defaults
 */
function resetDemoData() {
  const seed = (typeof USERS_DATA !== 'undefined' && USERS_DATA.length > 0)
    ? USERS_DATA[0]
    : {
        id: 'user-001',
        name: 'CafeNest User',
        phone: '+91 98765 43210',
        email: 'tejaswini@email.com',
        address: 'Amravati, Maharashtra',
        avatar: null
      };

  try {
    localStorage.removeItem(STORAGE_USER_KEY);
  } catch (err) {
    console.warn('Could not clear user profile from localStorage:', err);
  }

  currentUser = { ...seed };
  persistUser(currentUser);

  if (isEditMode) {
    setEditMode(false);
  }

  renderUserProfile();

  if (typeof showToast === 'function') {
    showToast('Demo profile reset to defaults');
  }
}

// Expose resetDemoData globally for external calls
window.resetDemoData = resetDemoData;

/**
 * Sets up tab navigation between panels (My Profile, Order History, Settings)
 */
function setupTabs() {
  const tabs = [
    { buttonId: 'tab-profile', panelId: 'panel-profile' },
    { buttonId: 'tab-orders', panelId: 'panel-orders' },
    { buttonId: 'tab-settings', panelId: 'panel-settings' }
  ];

  function switchTab(targetButtonId) {
    tabs.forEach(({ buttonId, panelId }) => {
      const btn = document.getElementById(buttonId);
      const panel = document.getElementById(panelId);
      const isTarget = buttonId === targetButtonId;

      if (btn) {
        btn.classList.toggle('active', isTarget);
        btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        btn.setAttribute('tabindex', isTarget ? '0' : '-1');
        if (isTarget) {
          btn.setAttribute('aria-current', 'page');
        } else {
          btn.removeAttribute('aria-current');
        }
      }

      if (panel) {
        if (isTarget) {
          panel.removeAttribute('hidden');
          panel.classList.add('panel-active');
        } else {
          panel.setAttribute('hidden', '');
          panel.classList.remove('panel-active');
        }
      }
    });
  }

  tabs.forEach(({ buttonId }) => {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.addEventListener('click', () => {
      switchTab(buttonId);
    });

    // Keyboard navigation (Arrow keys between tabs)
    btn.addEventListener('keydown', (e) => {
      let targetIndex = -1;
      const currentIndex = tabs.findIndex(t => t.buttonId === buttonId);

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        targetIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = tabs.length - 1;
      }

      if (targetIndex >= 0) {
        const nextTabId = tabs[targetIndex].buttonId;
        const nextTabBtn = document.getElementById(nextTabId);
        if (nextTabBtn) {
          switchTab(nextTabId);
          nextTabBtn.focus();
        }
      }
    });
  });
}

/**
 * Initialize page lifecycle
 */
document.addEventListener('DOMContentLoaded', () => {
  // Load initial user
  currentUser = getInitialUser();
  renderUserProfile();

  // Initialize tabs
  setupTabs();

  // Edit profile button
  document.getElementById('btn-edit-profile')?.addEventListener('click', () => {
    setEditMode(true);
  });

  // Cancel edit button
  document.getElementById('btn-cancel-edit')?.addEventListener('click', handleCancelEdit);

  // Form submit (Save button)
  document.getElementById('profile-form')?.addEventListener('submit', handleSaveProfile);

  // Cancel on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isEditMode) {
      handleCancelEdit();
    }
  });

  // Reset demo data buttons
  document.getElementById('btn-reset-demo-profile')?.addEventListener('click', resetDemoData);
  document.getElementById('btn-reset-demo-settings')?.addEventListener('click', resetDemoData);

  // Header Search Magnifier button
  document.getElementById('header-search-btn')?.addEventListener('click', () => {
    window.location.href = 'explore.html';
  });
});
