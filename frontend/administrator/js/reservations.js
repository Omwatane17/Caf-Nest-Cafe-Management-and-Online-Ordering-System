/**
 * CaféNest Administrator — Reservations Script
 * Handles table rendering, date filtering, status filtering, details modal,
 * status change actions, calendar overview modal, and toast notifications.
 */

(function () {
  'use strict';

  /* ── State ── */
  let reservationsList = [];
  let selectedDate = '2026-10-12'; // Initially 12 Oct 2026 to match screenshot
  let selectedStatus = 'All';
  let openMenuResId = null;

  /* ── DOM References ── */
  let tableBodyEl;
  let statusFilterEl;
  let datePickerBtnEl;
  let hiddenDateInputEl;
  let currentDateLabelEl;
  let btnViewCalendarEl;
  let filterResetBarEl;
  let btnResetFilterEl;

  // Modals
  let modalDetailsEl;
  let modalStatusEl;
  let modalCalendarEl;

  /* ── Date Helpers ── */
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatDateDisplay(isoDateStr) {
    if (!isoDateStr) return '';
    const parts = isoDateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = MONTH_NAMES[parseInt(parts[1], 10) - 1] || parts[1];
      const day = parseInt(parts[2], 10);
      return `${day} ${month} ${year}`;
    }
    return isoDateStr;
  }

  /* ── Render Reservations Table ── */
  function renderTable() {
    if (!tableBodyEl) return;

    // Filter by date and status
    const filtered = reservationsList.filter(res => {
      const matchesDate = !selectedDate || selectedDate === 'all' || res.date === selectedDate;
      const matchesStatus = selectedStatus === 'All' || res.status === selectedStatus;
      return matchesDate && matchesStatus;
    });

    // Update Filter Reset Bar visibility
    if (filterResetBarEl) {
      const isFiltered = (selectedDate && selectedDate !== 'all') || selectedStatus !== 'All';
      filterResetBarEl.hidden = !isFiltered;
      const filterSummaryEl = document.getElementById('filter-summary-text');
      if (filterSummaryEl) {
        const dateText = selectedDate === 'all' ? 'All dates' : formatDateDisplay(selectedDate);
        const statusText = selectedStatus === 'All' ? 'All statuses' : selectedStatus;
        filterSummaryEl.textContent = `Showing reservations for: ${dateText} • ${statusText} (${filtered.length} found)`;
      }
    }

    if (filtered.length === 0) {
      tableBodyEl.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="7">
            <div class="table-empty-box">
              <svg class="table-empty-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <h3 class="table-empty-title">No reservations found</h3>
              <p class="table-empty-desc">No reservations match the selected date or status filters.</p>
              <button type="button" class="btn-filter-reset" id="btn-empty-reset" style="margin-top:8px;">Reset filters</button>
            </div>
          </td>
        </tr>
      `;
      const btnEmptyReset = tableBodyEl.querySelector('#btn-empty-reset');
      if (btnEmptyReset) {
        btnEmptyReset.addEventListener('click', resetFilters);
      }
      return;
    }

    tableBodyEl.innerHTML = filtered.map(res => {
      const displayDate = formatDateDisplay(res.date);
      const statusClass = 'status-' + res.status.toLowerCase();
      const isMenuOpen = openMenuResId === res.id;

      return `
        <tr data-id="${escapeHtml(res.id)}">
          <td class="td-id">${escapeHtml(res.id)}</td>
          <td class="td-name">${escapeHtml(res.customerName)}</td>
          <td class="td-datetime">${escapeHtml(displayDate)}, ${escapeHtml(res.time)}</td>
          <td class="td-table">${escapeHtml(res.tableId)}</td>
          <td class="td-guests col-guests">${escapeHtml(String(res.guests))}</td>
          <td class="col-status">
            <span class="status-pill ${statusClass}">${escapeHtml(res.status)}</span>
          </td>
          <td class="col-action">
            <div class="action-buttons-wrap">
              <button type="button" class="btn-row-view" data-action="view" data-id="${escapeHtml(res.id)}" aria-label="View reservation ${escapeHtml(res.id)}">View</button>
              <button type="button" class="btn-row-more" data-action="menu" data-id="${escapeHtml(res.id)}" aria-label="Actions for reservation ${escapeHtml(res.id)}" aria-haspopup="true" aria-expanded="${isMenuOpen}">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="5" r="1.8"/>
                  <circle cx="12" cy="12" r="1.8"/>
                  <circle cx="12" cy="19" r="1.8"/>
                </svg>
              </button>
              
              <!-- Dropdown Menu -->
              <div class="row-action-menu" id="menu-${escapeHtml(res.id)}" ${isMenuOpen ? '' : 'hidden'} role="menu" aria-label="Reservation actions">
                <button type="button" class="menu-item-btn" data-action="view" data-id="${escapeHtml(res.id)}" role="menuitem">
                  <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  View Details
                </button>
                <div class="menu-divider" role="separator"></div>
                <button type="button" class="menu-item-btn" data-action="change-status" data-id="${escapeHtml(res.id)}" role="menuitem">
                  <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Change Status
                </button>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row button event listeners
    bindTableEvents();
  }

  /* ── Table Row Button Event Binding ── */
  function bindTableEvents() {
    // View buttons
    tableBodyEl.querySelectorAll('button[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeActionMenus();
        const id = btn.dataset.id;
        openDetailsModal(id);
      });
    });

    // Three-dot buttons
    tableBodyEl.querySelectorAll('button[data-action="menu"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        toggleActionMenu(id);
      });
    });

    // Change status menu items
    tableBodyEl.querySelectorAll('button[data-action="change-status"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeActionMenus();
        const id = btn.dataset.id;
        openStatusModal(id);
      });
    });
  }

  /* ── Toggle Dropdown Menu ── */
  function toggleActionMenu(id) {
    if (openMenuResId === id) {
      closeActionMenus();
    } else {
      closeActionMenus();
      openMenuResId = id;
      const menu = document.getElementById(`menu-${id}`);
      const btn = tableBodyEl.querySelector(`button[data-action="menu"][data-id="${id}"]`);
      if (menu) menu.removeAttribute('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeActionMenus() {
    if (openMenuResId) {
      const menu = document.getElementById(`menu-${openMenuResId}`);
      const btn = tableBodyEl.querySelector(`button[data-action="menu"][data-id="${openMenuResId}"]`);
      if (menu) menu.setAttribute('hidden', '');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      openMenuResId = null;
    }
  }

  /* ── View Details Modal ── */
  function openDetailsModal(id) {
    const res = reservationsList.find(r => r.id === id);
    if (!res || !modalDetailsEl) return;

    const displayDate = formatDateDisplay(res.date);
    const statusClass = 'status-' + res.status.toLowerCase();

    const bodyEl = modalDetailsEl.querySelector('#details-modal-body');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="details-kv-list">
          <div class="details-kv-row">
            <span class="details-k">Reservation ID</span>
            <span class="details-v">${escapeHtml(res.id)}</span>
          </div>
          <div class="details-kv-row">
            <span class="details-k">Customer Name</span>
            <span class="details-v">${escapeHtml(res.customerName)}</span>
          </div>
          <div class="details-kv-row">
            <span class="details-k">Date &amp; Time</span>
            <span class="details-v">${escapeHtml(displayDate)}, ${escapeHtml(res.time)}</span>
          </div>
          <div class="details-kv-row">
            <span class="details-k">Table</span>
            <span class="details-v">Table ${escapeHtml(res.tableId)}</span>
          </div>
          <div class="details-kv-row">
            <span class="details-k">Guests</span>
            <span class="details-v">${escapeHtml(String(res.guests))} People</span>
          </div>
          <div class="details-kv-row">
            <span class="details-k">Current Status</span>
            <span class="details-v">
              <span class="status-pill ${statusClass}">${escapeHtml(res.status)}</span>
            </span>
          </div>
        </div>
      `;
    }

    modalDetailsEl.removeAttribute('hidden');
    const closeBtn = modalDetailsEl.querySelector('.btn-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  /* ── Change Status Modal ── */
  let targetStatusResId = null;

  function openStatusModal(id) {
    const res = reservationsList.find(r => r.id === id);
    if (!res || !modalStatusEl) return;

    targetStatusResId = id;
    const titleEl = modalStatusEl.querySelector('#status-modal-title');
    if (titleEl) {
      titleEl.textContent = `Update Status — ${res.id}`;
    }

    // Preselect current status
    const radios = modalStatusEl.querySelectorAll('input[name="res-status-choice"]');
    radios.forEach(radio => {
      radio.checked = radio.value === res.status;
      const card = radio.closest('.status-radio-card');
      if (card) {
        card.classList.toggle('selected', radio.checked);
      }
    });

    modalStatusEl.removeAttribute('hidden');
  }

  function handleSaveStatus() {
    if (!targetStatusResId) return;
    const res = reservationsList.find(r => r.id === targetStatusResId);
    if (!res) return;

    const checkedRadio = modalStatusEl.querySelector('input[name="res-status-choice"]:checked');
    if (!checkedRadio) return;

    const newStatus = checkedRadio.value;
    res.status = newStatus;

    modalStatusEl.setAttribute('hidden', '');
    renderTable();

    if (typeof showAdminToast === 'function') {
      showAdminToast(`Reservation ${res.id} marked as ${newStatus}`);
    }
  }

  /* ── Calendar Overview Modal ── */
  function openCalendarModal() {
    if (!modalCalendarEl) return;

    // Render month view for October 2026
    const gridEl = modalCalendarEl.querySelector('#calendar-month-grid');
    if (gridEl) {
      renderCalendarMonthGrid(gridEl);
    }

    modalCalendarEl.removeAttribute('hidden');
  }

  function renderCalendarMonthGrid(gridEl) {
    // October 2026: Oct 1 starts on Thursday (index 4 in Sun-first: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6)
    const daysInMonth = 31;
    const startDayOfWeek = 4; // Thursday

    let html = `
      <div class="cal-day-head">Sun</div>
      <div class="cal-day-head">Mon</div>
      <div class="cal-day-head">Tue</div>
      <div class="cal-day-head">Wed</div>
      <div class="cal-day-head">Thu</div>
      <div class="cal-day-head">Fri</div>
      <div class="cal-day-head">Sat</div>
    `;

    // Empty cells before 1st Oct
    for (let i = 0; i < startDayOfWeek; i++) {
      html += `<div class="cal-day-cell other-month" aria-hidden="true"></div>`;
    }

    // Days 1 to 31
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const isoDate = `2026-10-${dayStr}`;
      const count = reservationsList.filter(r => r.date === isoDate).length;
      const isSelected = selectedDate === isoDate;
      const hasEvents = count > 0;

      html += `
        <button type="button" 
          class="cal-day-cell${hasEvents ? ' has-events' : ''}${isSelected ? ' is-selected' : ''}" 
          data-date="${isoDate}" 
          aria-label="${day} October 2026, ${count} reservations">
          <span>${day}</span>
          ${hasEvents ? `<span class="cal-day-badge" title="${count} reservations"></span>` : ''}
        </button>
      `;
    }

    gridEl.innerHTML = html;

    // Attach click listeners to calendar days
    gridEl.querySelectorAll('.cal-day-cell:not(.other-month)').forEach(btn => {
      btn.addEventListener('click', () => {
        const date = btn.dataset.date;
        selectedDate = date;
        if (hiddenDateInputEl) hiddenDateInputEl.value = date;
        if (currentDateLabelEl) currentDateLabelEl.textContent = formatDateDisplay(date);
        modalCalendarEl.setAttribute('hidden', '');
        renderTable();
      });
    });
  }

  /* ── Filter Resets ── */
  function resetFilters() {
    selectedDate = 'all'; // Show all dates so all 6 demo rows are immediately viewable
    selectedStatus = 'All';
    if (statusFilterEl) statusFilterEl.value = 'All';
    if (currentDateLabelEl) currentDateLabelEl.textContent = 'All Dates';
    renderTable();
  }

  /* ── Safe HTML Escaping ── */
  function escapeHtml(str) {
    if (typeof _escHtml === 'function') return _escHtml(str);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ── Initialization ── */
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Render Admin Shell with reservations active
    if (typeof renderShell === 'function') {
      renderShell('reservations');
    }

    // 2. Clone initial seed data
    if (Array.isArray(window.ADMIN_RESERVATIONS)) {
      reservationsList = JSON.parse(JSON.stringify(window.ADMIN_RESERVATIONS));
    } else {
      reservationsList = [];
    }

    // 3. Cache DOM elements
    tableBodyEl = document.getElementById('reservations-tbody');
    statusFilterEl = document.getElementById('status-filter');
    datePickerBtnEl = document.getElementById('date-picker-btn');
    hiddenDateInputEl = document.getElementById('hidden-date-input');
    currentDateLabelEl = document.getElementById('current-date-label');
    btnViewCalendarEl = document.getElementById('btn-view-calendar');
    filterResetBarEl = document.getElementById('filter-reset-bar');
    btnResetFilterEl = document.getElementById('btn-reset-filters');

    modalDetailsEl = document.getElementById('modal-details');
    modalStatusEl = document.getElementById('modal-status');
    modalCalendarEl = document.getElementById('modal-calendar');

    // 4. Status Filter Change Listener
    if (statusFilterEl) {
      statusFilterEl.addEventListener('change', (e) => {
        selectedStatus = e.target.value;
        renderTable();
      });
    }

    // 5. Date Filter Listeners
    if (datePickerBtnEl && hiddenDateInputEl) {
      datePickerBtnEl.addEventListener('click', () => {
        if (typeof hiddenDateInputEl.showPicker === 'function') {
          try {
            hiddenDateInputEl.showPicker();
          } catch (_) {
            hiddenDateInputEl.click();
          }
        } else {
          hiddenDateInputEl.click();
        }
      });
    }

    if (hiddenDateInputEl) {
      hiddenDateInputEl.addEventListener('change', (e) => {
        selectedDate = e.target.value;
        if (currentDateLabelEl) {
          currentDateLabelEl.textContent = formatDateDisplay(selectedDate);
        }
        renderTable();
      });
    }

    // Reset filters button in summary bar
    if (btnResetFilterEl) {
      btnResetFilterEl.addEventListener('click', resetFilters);
    }

    // 6. View Calendar Button Listener
    if (btnViewCalendarEl) {
      btnViewCalendarEl.addEventListener('click', openCalendarModal);
    }

    // 7. Status modal radio cards selection styling
    if (modalStatusEl) {
      modalStatusEl.querySelectorAll('.status-radio-card').forEach(card => {
        card.addEventListener('click', () => {
          const radio = card.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
          modalStatusEl.querySelectorAll('.status-radio-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });
      });

      const btnSaveStatus = modalStatusEl.querySelector('#btn-save-status');
      if (btnSaveStatus) {
        btnSaveStatus.addEventListener('click', handleSaveStatus);
      }
    }

    // 8. Close Modals Handlers
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      // Close button
      const closeBtn = modal.querySelector('.btn-modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.setAttribute('hidden', ''));
      }
      // Cancel button
      const cancelBtn = modal.querySelector('.btn-modal-cancel');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modal.setAttribute('hidden', ''));
      }
      // Backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.setAttribute('hidden', '');
        }
      });
    });

    // 9. Document click to close action dropdown menus
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.action-buttons-wrap')) {
        closeActionMenus();
      }
    });

    // 10. Escape key to close open menus or modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeActionMenus();
        document.querySelectorAll('.modal-backdrop:not([hidden])').forEach(modal => {
          modal.setAttribute('hidden', '');
        });
      }
    });

    // 11. Initial Table Render
    renderTable();
  });

})();
