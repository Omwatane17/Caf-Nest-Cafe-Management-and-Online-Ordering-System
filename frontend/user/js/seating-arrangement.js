/**
 * CaféNest - Seating Arrangement Logic
 */

// Seating State
let currentCafe = null;
let selectedTable = null; // Default to Table 7 as in screenshot
let currentReservation = {
  date: '2026-10-12',
  dateDisplay: '12 Oct 2026',
  time: '18:00',
  timeDisplay: '06:00 PM',
  guests: 4
};

// Local storage booking key prefix
const STORAGE_BOOKINGS_KEY = 'cafenest_bookings';

/**
 * Resolves active cafe from URL or defaults to The Brew House
 */
function resolveCafe() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    const found = CAFES_DATA.find(c => c.id === id);
    if (found) return found;
  }
  return CAFES_DATA[0]; // The Brew House
}

/**
 * Builds floor plan table nodes and sets Table 7 selected initially
 */
function renderFloorPlan() {
  const indoorZone = document.getElementById('zone-indoor');
  const outdoorZone = document.getElementById('zone-outdoor');
  if (!indoorZone || !outdoorZone) return;

  // Clear existing nodes except labels
  indoorZone.querySelectorAll('.table-node').forEach(n => n.remove());
  outdoorZone.querySelectorAll('.table-node').forEach(n => n.remove());

  // Default initial table selection is Table 7
  if (!selectedTable) {
    selectedTable = SEATING_TABLES.find(t => t.number === 7) || SEATING_TABLES[0];
  }

  SEATING_TABLES.forEach(table => {
    const isIndoor = table.section === 'indoor';
    const targetZone = isIndoor ? indoorZone : outdoorZone;

    const isSelected = selectedTable && selectedTable.id === table.id;
    let statusClass = table.defaultStatus;
    if (isSelected) statusClass = 'selected';

    const node = document.createElement('div');
    node.className = `table-node ${statusClass} ${table.section} ${table.hasUmbrella ? 'umbrella' : ''}`;
    node.setAttribute('data-id', table.id);
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', `Table ${table.number}, capacity ${table.capacity}, status ${statusClass}`);
    node.tabIndex = table.defaultStatus === 'booked' ? -1 : 0;

    // Relative coordinates within the zone
    // Indoor takes 0-80% of width; outdoor takes remaining
    let leftPct = table.left;
    if (!isIndoor) {
      // Scale left coordinate for outdoor zone
      leftPct = (table.left - 80) * 5;
    }
    node.style.top = `${table.top}%`;
    node.style.left = `${leftPct}%`;

    // Chairs wrapper
    let chairsHtml = '';
    if (table.chairs === 4) {
      chairsHtml = `
        <div class="chair-dot chair-top"></div>
        <div class="chair-dot chair-bottom"></div>
        <div class="chair-dot chair-left"></div>
        <div class="chair-dot chair-right"></div>
      `;
    } else if (table.chairs === 2) {
      chairsHtml = `
        <div class="chair-dot chair-left"></div>
        <div class="chair-dot chair-right"></div>
      `;
    }

    node.innerHTML = `
      <div class="table-chairs-wrap">
        ${chairsHtml}
        <div class="table-surface">
          ${table.hasUmbrella ? '' : table.number}
        </div>
      </div>
    `;

    // Click handler
    node.addEventListener('click', () => {
      handleTableClick(table);
    });

    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTableClick(table);
      }
    });

    targetZone.appendChild(node);
  });
}

/**
 * Handles selecting a table node
 */
function handleTableClick(table) {
  if (table.defaultStatus === 'booked') {
    showToast(`Table ${table.number} is already booked for this time.`);
    return;
  }

  selectedTable = table;
  updateTableDetailsPanel(table);

  // Update classes
  document.querySelectorAll('.table-node').forEach(node => {
    const id = node.getAttribute('data-id');
    const tableObj = SEATING_TABLES.find(t => t.id === id);
    if (!tableObj) return;

    if (tableObj.id === table.id) {
      node.className = `table-node selected ${tableObj.section} ${tableObj.hasUmbrella ? 'umbrella' : ''}`;
      node.setAttribute('aria-selected', 'true');
    } else {
      node.className = `table-node ${tableObj.defaultStatus} ${tableObj.section} ${tableObj.hasUmbrella ? 'umbrella' : ''}`;
      node.removeAttribute('aria-selected');
    }
  });

  // Capacity check feedback
  if (table.capacity < currentReservation.guests) {
    showToast(`Note: Table ${table.number} accommodates ${table.capacity} guests (Party size is ${currentReservation.guests}).`);
  }
}

/**
 * Updates the right-hand Table Details panel
 */
function updateTableDetailsPanel(table) {
  const nameEl = document.getElementById('details-table-name');
  const capEl = document.getElementById('details-table-cap');
  const typeEl = document.getElementById('details-table-type');

  if (nameEl) nameEl.textContent = `Table ${table.number}`;
  if (capEl) capEl.textContent = table.capacity;
  if (typeEl) typeEl.textContent = table.type;
}

/**
 * Handles Check Availability button click
 */
function handleCheckAvailability() {
  const dateSelect = document.getElementById('select-date');
  const timeSelect = document.getElementById('select-time');
  const guestsSelect = document.getElementById('select-guests');

  currentReservation.date = dateSelect.value;
  currentReservation.dateDisplay = dateSelect.options[dateSelect.selectedIndex].text;
  currentReservation.time = timeSelect.value;
  currentReservation.timeDisplay = timeSelect.options[timeSelect.selectedIndex].text;
  currentReservation.guests = parseInt(guestsSelect.value, 10);

  // Re-verify capacity
  if (selectedTable && selectedTable.capacity < currentReservation.guests) {
    showToast(`Availability updated! Selected Table ${selectedTable.number} (seats ${selectedTable.capacity}) is too small for ${currentReservation.guests} guests.`);
  } else {
    showToast(`Availability checked for ${currentReservation.guests} guests on ${currentReservation.dateDisplay} at ${currentReservation.timeDisplay}. Tables updated!`);
  }
}

/**
 * Navigates to booking form with reservation parameters
 */
function handleBookNow() {
  if (!selectedTable) {
    showToast('Please select an available table first.');
    return;
  }

  if (selectedTable.capacity < currentReservation.guests) {
    showToast(`Cannot book: Table ${selectedTable.number} only accommodates ${selectedTable.capacity} guests. Please choose a larger table.`);
    return;
  }

  const params = new URLSearchParams({
    cafeId: currentCafe.id,
    table: selectedTable.number,
    tableName: `Table ${selectedTable.number} (${selectedTable.type})`,
    capacity: selectedTable.capacity,
    date: currentReservation.dateDisplay,
    time: currentReservation.timeDisplay,
    guests: currentReservation.guests
  });

  window.location.href = `booking-form.html?${params.toString()}`;
}

/**
 * Closes confirmation modal
 */
function closeModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.remove('open');
}

/**
 * Confirms booking demo
 */
function confirmBookingDemo() {
  closeModal();

  // Save demo reservation in localStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_BOOKINGS_KEY) || '[]');
    const newBooking = {
      cafeId: currentCafe.id,
      cafeName: currentCafe.name,
      table: selectedTable.number,
      date: currentReservation.dateDisplay,
      time: currentReservation.timeDisplay,
      guests: currentReservation.guests,
      bookedAt: new Date().toISOString()
    };
    existing.push(newBooking);
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn('LocalStorage error saving demo booking:', e);
  }

  showToast(`Booking Confirmed! Table ${selectedTable.number} reserved for ${currentReservation.guests} guests.`);
}

document.addEventListener('DOMContentLoaded', () => {
  currentCafe = resolveCafe();

  // Set Back link destination to this cafe's details page
  const backLink = document.getElementById('btn-back-cafe');
  if (backLink) {
    backLink.href = `cafe-details.html?id=${currentCafe.id}`;
  }

  // Cafe Name Header
  const titleEl = document.getElementById('seating-cafe-name');
  if (titleEl) {
    titleEl.textContent = currentCafe.name;
  }

  // Render initial floor plan
  renderFloorPlan();
  if (selectedTable) {
    updateTableDetailsPanel(selectedTable);
  }

  // Check Availability button
  document.getElementById('btn-check-avail')?.addEventListener('click', handleCheckAvailability);

  // Book Now button
  document.getElementById('btn-book-now')?.addEventListener('click', handleBookNow);

  // Modal actions
  document.getElementById('btn-modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('btn-modal-confirm')?.addEventListener('click', confirmBookingDemo);

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
