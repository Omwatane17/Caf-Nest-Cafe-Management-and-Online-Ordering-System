/**
 * CaféNest - Booking Form Logic
 */

const STORAGE_BOOKINGS_KEY = 'cafenest_bookings';

// Reservation & Cafe State
let bookingState = {
  cafeId: 'brew-house',
  cafe: null,
  table: 7,
  tableName: 'Table 7 (Round)',
  capacity: 4,
  date: '12 Oct 2026',
  time: '06:00 PM',
  guests: 4
};

/**
 * Parses query params from URL or falls back to demo values matching booking form.png
 */
function resolveBookingParams() {
  const params = new URLSearchParams(window.location.search);
  
  const cafeId = params.get('cafeId') || 'brew-house';
  bookingState.cafeId = cafeId;
  bookingState.cafe = CAFES_DATA.find(c => c.id === cafeId) || CAFES_DATA[0];

  if (params.get('table')) bookingState.table = params.get('table');
  if (params.get('tableName')) bookingState.tableName = params.get('tableName');
  if (params.get('capacity')) bookingState.capacity = params.get('capacity');
  if (params.get('date')) bookingState.date = params.get('date');
  if (params.get('time')) bookingState.time = params.get('time');
  if (params.get('guests')) bookingState.guests = params.get('guests');
}

/**
 * Populates header reservation items and right card summary
 */
function renderBookingSummary() {
  const cafe = bookingState.cafe;

  // Header Cafe Title & Meta
  const headerCafeName = document.getElementById('header-cafe-name');
  const metaDate = document.getElementById('meta-date');
  const metaTime = document.getElementById('meta-time');
  const metaGuests = document.getElementById('meta-guests');
  const editLink = document.getElementById('btn-edit-reservation');

  if (headerCafeName) headerCafeName.textContent = cafe.name;
  if (metaDate) metaDate.textContent = bookingState.date;
  if (metaTime) metaTime.textContent = bookingState.time;
  if (metaGuests) metaGuests.textContent = `${bookingState.guests} People`;

  // Set Edit link back to seating.html with state preserved
  if (editLink) {
    const editParams = new URLSearchParams({
      id: cafe.id,
      table: bookingState.table,
      date: bookingState.date,
      time: bookingState.time,
      guests: bookingState.guests
    });
    editLink.href = `seating.html?${editParams.toString()}`;
  }

  // Right Card Summary Fields
  const summaryName = document.getElementById('summary-cafe-name');
  const summaryLocation = document.getElementById('summary-cafe-location');
  const summaryTable = document.getElementById('summary-table-name');
  const summaryCapacity = document.getElementById('summary-capacity');
  const summaryDateTime = document.getElementById('summary-datetime');
  const summaryImg = document.getElementById('summary-cafe-img');

  if (summaryName) summaryName.textContent = cafe.name;
  if (summaryLocation) summaryLocation.textContent = `${cafe.city} \u2022 ${cafe.distanceKm} km`;
  if (summaryTable) summaryTable.textContent = `Table ${bookingState.table} (Round)`;
  if (summaryCapacity) summaryCapacity.textContent = `Capacity: ${bookingState.capacity}`;
  if (summaryDateTime) summaryDateTime.textContent = `${bookingState.date}, ${bookingState.time}`;

  if (summaryImg) {
    summaryImg.src = cafe.image;
    summaryImg.alt = cafe.name;
  }
}

/**
 * Validates Indian Phone number format (supports +91 with 10 digits, or direct 10 digits)
 */
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Matches +91XXXXXXXXXX or 91XXXXXXXXXX or 10-digit starting with 6,7,8,9
  return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates Email format
 */
function isValidEmail(email) {
  if (!email) return true; // Optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Form validation routine
 */
function validateBookingForm() {
  let isValid = true;

  const nameInput = document.getElementById('customer-name');
  const phoneInput = document.getElementById('customer-phone');
  const emailInput = document.getElementById('customer-email');
  const termsCheckbox = document.getElementById('terms-checkbox');

  const nameErr = document.getElementById('err-name');
  const phoneErr = document.getElementById('err-phone');
  const emailErr = document.getElementById('err-email');
  const termsErr = document.getElementById('err-terms');

  // Reset errors
  [nameInput, phoneInput, emailInput].forEach(el => el.classList.remove('error'));
  [nameErr, phoneErr, emailErr, termsErr].forEach(el => el.classList.remove('visible'));

  // 1. Name validation
  if (!nameInput.value.trim()) {
    nameInput.classList.add('error');
    nameErr.textContent = 'Please enter your full name.';
    nameErr.classList.add('visible');
    isValid = false;
  }

  // 2. Phone validation
  if (!phoneInput.value.trim()) {
    phoneInput.classList.add('error');
    phoneErr.textContent = 'Please enter your phone number.';
    phoneErr.classList.add('visible');
    isValid = false;
  } else if (!isValidPhone(phoneInput.value.trim())) {
    phoneInput.classList.add('error');
    phoneErr.textContent = 'Please enter a valid 10-digit Indian phone number.';
    phoneErr.classList.add('visible');
    isValid = false;
  }

  // 3. Email validation (optional)
  if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
    emailInput.classList.add('error');
    emailErr.textContent = 'Please enter a valid email address.';
    emailErr.classList.add('visible');
    isValid = false;
  }

  // 4. Terms and conditions validation
  if (!termsCheckbox.checked) {
    termsErr.textContent = 'You must agree to the terms and conditions to proceed.';
    termsErr.classList.add('visible');
    isValid = false;
  }

  return isValid;
}

/**
 * Generates formatted booking reference code
 */
function generateBookingReference() {
  const dateStr = '20261012';
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `CN-${dateStr}-${randomSuffix}`;
}

/**
 * Handles Confirm Booking submission
 */
function handleConfirmBooking(e) {
  e.preventDefault();

  if (!validateBookingForm()) {
    showToast('Please fix the errors in the form.');
    return;
  }

  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const requests = document.getElementById('customer-requests').value.trim();
  const refId = generateBookingReference();

  // Save to localStorage demo bookings list
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_BOOKINGS_KEY) || '[]');
    const newReservation = {
      referenceId: refId,
      cafeId: bookingState.cafeId,
      cafeName: bookingState.cafe.name,
      city: bookingState.cafe.city || 'Amravati',
      distanceKm: bookingState.cafe.distanceKm || 1.2,
      image: bookingState.cafe.image || 'assets/cafe-brew-house.jpg',
      table: bookingState.table,
      tableName: `Table ${bookingState.table}`,
      date: bookingState.date,
      time: bookingState.time,
      guests: bookingState.guests,
      status: 'Confirmed',
      category: 'upcoming',
      customer: { name, phone, email, specialRequests: requests },
      createdAt: new Date().toISOString()
    };
    existing.unshift(newReservation);
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }

  // Populate success confirmation modal
  document.getElementById('modal-ref-id').textContent = refId;
  document.getElementById('modal-summary-cafe').textContent = bookingState.cafe.name;
  document.getElementById('modal-summary-table').textContent = `Table ${bookingState.table}`;
  document.getElementById('modal-summary-datetime').textContent = `${bookingState.date}, ${bookingState.time}`;
  document.getElementById('modal-summary-guests').textContent = `${bookingState.guests} People`;
  document.getElementById('modal-summary-name').textContent = name;

  // Open modal
  const modal = document.getElementById('booking-success-modal');
  if (modal) modal.classList.add('open');
}

/**
 * Opens Terms and Conditions demo modal
 */
function openTermsModal(e) {
  if (e) e.preventDefault();
  const termsModal = document.getElementById('terms-modal');
  if (termsModal) termsModal.classList.add('open');
}

/**
 * Closes any open modal
 */
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

document.addEventListener('DOMContentLoaded', () => {
  resolveBookingParams();
  renderBookingSummary();

  // Form submit
  document.getElementById('booking-form')?.addEventListener('submit', handleConfirmBooking);
  document.getElementById('btn-confirm-submit')?.addEventListener('click', handleConfirmBooking);

  // Terms link click
  document.getElementById('btn-terms-link')?.addEventListener('click', openTermsModal);

  // Modal dismiss buttons
  document.querySelectorAll('.btn-modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });
});
