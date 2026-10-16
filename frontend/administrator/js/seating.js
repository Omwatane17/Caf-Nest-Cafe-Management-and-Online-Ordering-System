/**
 * CaféNest Administrator — Seating Arrangement Script
 * Manages seating floor plan, table selection, status updates, and add table modal.
 */

(function () {
  'use strict';

  /* ── State ── */
  let seatingTables = [];
  let currentZone = 'Indoor';
  let selectedTableId = 't-007'; // Table T6 (Occupied) matching screenshot initial state

  /* ── DOM References ── */
  let canvasEl;
  let zoneSelectEl;
  let detailsPanelEl;
  let btnAddTableEl;
  let modalAddTableEl;
  let formAddTableEl;
  let btnCloseModalEl;
  let btnCancelModalEl;

  /* ── Deterministic Position Generator for New Tables ── */
  function findAvailablePosition(zone) {
    const existing = seatingTables.filter(t => t.zone === zone);
    const candidateSlots = [
      { x: 18, y: 52 },
      { x: 34, y: 72 },
      { x: 50, y: 32 },
      { x: 74, y: 44 },
      { x: 28, y: 38 },
      { x: 62, y: 38 },
      { x: 44, y: 64 },
      { x: 68, y: 72 },
      { x: 84, y: 36 },
      { x: 18, y: 38 }
    ];

    for (const slot of candidateSlots) {
      const tooClose = existing.some(t => {
        const dx = t.posX - slot.x;
        const dy = t.posY - slot.y;
        return Math.sqrt(dx * dx + dy * dy) < 14;
      });
      if (!tooClose) {
        return slot;
      }
    }

    // Fallback: bounded offset
    const count = existing.length;
    const col = count % 4;
    const row = Math.floor(count / 4) % 3;
    return {
      x: Math.min(82, 22 + col * 18),
      y: Math.min(78, 28 + row * 22)
    };
  }

  /* ── Render Floor Plan ── */
  function renderFloorPlan() {
    if (!canvasEl) return;

    // Preserve architectural decorations & entrance, only clear table nodes and empty state
    const existingNodes = canvasEl.querySelectorAll('.table-node, .zone-empty-state');
    existingNodes.forEach(node => node.remove());

    const zoneTables = seatingTables.filter(t => t.zone === currentZone);

    if (zoneTables.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'zone-empty-state';
      emptyState.innerHTML = `
        <svg class="zone-empty-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" stroke="currentColor"/>
          <path d="M4 9h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9z" stroke="currentColor"/>
          <line x1="8" y1="15" x2="8" y2="20" stroke="currentColor"/>
          <line x1="16" y1="15" x2="16" y2="20" stroke="currentColor"/>
        </svg>
        <h3 class="zone-empty-title">No tables in ${escapeHtml(currentZone)}</h3>
        <p class="zone-empty-desc">There are currently no seating arrangements set up for the ${escapeHtml(currentZone.toLowerCase())} zone.</p>
        <button type="button" class="btn-add-table" id="btn-empty-add-table">
          <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Table to ${escapeHtml(currentZone)}
        </button>
      `;
      canvasEl.appendChild(emptyState);

      const btnEmptyAdd = emptyState.querySelector('#btn-empty-add-table');
      if (btnEmptyAdd) {
        btnEmptyAdd.addEventListener('click', openAddModal);
      }
      return;
    }

    zoneTables.forEach(table => {
      const node = document.createElement('button');
      node.type = 'button';
      node.className = 'table-node' + (table.id === selectedTableId ? ' is-selected' : '');
      node.dataset.id = table.id;
      node.dataset.type = table.type;
      node.dataset.capacity = table.capacity;
      node.dataset.status = table.status;
      node.style.left = `${table.posX}%`;
      node.style.top = `${table.posY}%`;
      node.setAttribute('aria-pressed', table.id === selectedTableId ? 'true' : 'false');
      node.setAttribute('aria-label', `Table ${table.label}, Capacity ${table.capacity}, Status ${table.status}`);

      // Chair layout
      let chairsHtml = '';
      if (table.capacity >= 2) {
        chairsHtml += '<span class="chair chair-top" aria-hidden="true"></span>';
        chairsHtml += '<span class="chair chair-bottom" aria-hidden="true"></span>';
      }
      if (table.capacity >= 4) {
        chairsHtml += '<span class="chair chair-left" aria-hidden="true"></span>';
        chairsHtml += '<span class="chair chair-right" aria-hidden="true"></span>';
      }

      node.innerHTML = `
        ${chairsHtml}
        <span class="table-surface">${escapeHtml(table.label)}</span>
      `;

      node.addEventListener('click', () => selectTable(table.id));
      canvasEl.appendChild(node);
    });
  }

  /* ── Select Table ── */
  function selectTable(id) {
    selectedTableId = id;

    // Update node visual highlight and aria attributes
    const nodes = canvasEl.querySelectorAll('.table-node');
    nodes.forEach(node => {
      const isSelected = node.dataset.id === id;
      node.classList.toggle('is-selected', isSelected);
      node.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    renderTableDetails();
  }

  /* ── Render Table Details Panel ── */
  function renderTableDetails() {
    if (!detailsPanelEl) return;

    const table = seatingTables.find(t => t.id === selectedTableId);

    if (!table) {
      detailsPanelEl.innerHTML = `
        <h2 class="details-section-title">Table Details</h2>
        <p class="details-empty-note">Select a table on the floor plan to view details and update its status.</p>
        <hr class="details-divider">
        <div class="quick-actions-section">
          <h3 class="quick-actions-title">Quick Actions</h3>
          <div class="action-buttons-list">
            <button type="button" class="btn-quick-action btn-action-available" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Mark as Available
            </button>
            <button type="button" class="btn-quick-action btn-action-reserved" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Mark as Reserved
            </button>
            <button type="button" class="btn-quick-action btn-action-unavailable" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Mark as Unavailable
            </button>
          </div>
        </div>
      `;
      return;
    }

    const badgeClass = {
      'Available': 'badge-available',
      'Occupied': 'badge-occupied',
      'Reserved': 'badge-reserved',
      'Unavailable': 'badge-unavailable'
    }[table.status] || 'badge-available';

    detailsPanelEl.innerHTML = `
      <h2 class="details-section-title">Table Details</h2>
      <div class="details-content">
        <h3 class="details-table-title">Table ${escapeHtml(table.label)}</h3>
        <div class="details-info-row">
          <p class="details-meta-line"><span class="details-meta-muted">Capacity:</span> ${escapeHtml(String(table.capacity))}</p>
          <p class="details-meta-line"><span class="details-meta-muted">Type:</span> ${escapeHtml(table.zone)}</p>
        </div>
        <span class="details-status-badge ${badgeClass}">${escapeHtml(table.status)}</span>
      </div>

      <hr class="details-divider">

      <div class="quick-actions-section">
        <h3 class="quick-actions-title">Quick Actions</h3>
        <div class="action-buttons-list">
          <button type="button" class="btn-quick-action btn-action-available" id="btn-mark-available" aria-label="Mark Table ${escapeHtml(table.label)} as Available">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Mark as Available
          </button>
          <button type="button" class="btn-quick-action btn-action-reserved" id="btn-mark-reserved" aria-label="Mark Table ${escapeHtml(table.label)} as Reserved">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            Mark as Reserved
          </button>
          <button type="button" class="btn-quick-action btn-action-unavailable" id="btn-mark-unavailable" aria-label="Mark Table ${escapeHtml(table.label)} as Unavailable">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Mark as Unavailable
          </button>
        </div>
      </div>
    `;

    // Bind Quick Action buttons
    const btnAvail = detailsPanelEl.querySelector('#btn-mark-available');
    const btnRes = detailsPanelEl.querySelector('#btn-mark-reserved');
    const btnUnavail = detailsPanelEl.querySelector('#btn-mark-unavailable');

    if (btnAvail) btnAvail.addEventListener('click', () => updateTableStatus(table.id, 'Available'));
    if (btnRes) btnRes.addEventListener('click', () => updateTableStatus(table.id, 'Reserved'));
    if (btnUnavail) btnUnavail.addEventListener('click', () => updateTableStatus(table.id, 'Unavailable'));
  }

  /* ── Update Table Status ── */
  function updateTableStatus(id, newStatus) {
    const table = seatingTables.find(t => t.id === id);
    if (!table) return;

    table.status = newStatus;

    // Update node in floor plan if visible
    const node = canvasEl.querySelector(`.table-node[data-id="${id}"]`);
    if (node) {
      node.dataset.status = newStatus;
      node.setAttribute('aria-label', `Table ${table.label}, Capacity ${table.capacity}, Status ${newStatus}`);
    }

    // Refresh details panel
    renderTableDetails();

    // Show toast
    if (typeof showAdminToast === 'function') {
      showAdminToast(`Table ${table.label} marked as ${newStatus}`);
    }
  }

  /* ── Add Table Modal Logic ── */
  function openAddModal() {
    if (!modalAddTableEl) return;

    // Suggest next ID
    const nextNum = seatingTables.length + 1;
    const inputId = document.getElementById('field-table-id');
    const inputCap = document.getElementById('field-capacity');
    const inputType = document.getElementById('field-type');
    const inputZone = document.getElementById('field-zone');
    const inputStatus = document.getElementById('field-status');

    if (inputId) inputId.value = `T${nextNum}`;
    if (inputCap) inputCap.value = '4';
    if (inputType) inputType.value = 'Round';
    if (inputZone) inputZone.value = currentZone;
    if (inputStatus) inputStatus.value = 'Available';

    clearFormErrors();
    modalAddTableEl.removeAttribute('hidden');
    if (inputId) inputId.focus();
  }

  function closeAddModal() {
    if (!modalAddTableEl) return;
    modalAddTableEl.setAttribute('hidden', '');
    clearFormErrors();
    if (formAddTableEl) formAddTableEl.reset();
  }

  function clearFormErrors() {
    const errId = document.getElementById('err-table-id');
    const errCap = document.getElementById('err-capacity');
    if (errId) errId.textContent = '';
    if (errCap) errCap.textContent = '';
  }

  function handleAddTableSubmit(e) {
    e.preventDefault();
    clearFormErrors();

    const inputId = document.getElementById('field-table-id');
    const inputCap = document.getElementById('field-capacity');
    const inputType = document.getElementById('field-type');
    const inputZone = document.getElementById('field-zone');
    const inputStatus = document.getElementById('field-status');

    const label = (inputId ? inputId.value : '').trim().toUpperCase();
    const capacity = parseInt(inputCap ? inputCap.value : '0', 10);
    const type = inputType ? inputType.value : 'Round';
    const zone = inputZone ? inputZone.value : currentZone;
    const status = inputStatus ? inputStatus.value : 'Available';

    let hasError = false;

    if (!label) {
      const err = document.getElementById('err-table-id');
      if (err) err.textContent = 'Table ID is required.';
      hasError = true;
    } else {
      // Check duplicate ID/label in the same zone
      const exists = seatingTables.some(t => t.zone === zone && t.label.toUpperCase() === label);
      if (exists) {
        const err = document.getElementById('err-table-id');
        if (err) err.textContent = `A table with ID "${label}" already exists in ${zone}.`;
        hasError = true;
      }
    }

    if (isNaN(capacity) || capacity < 1) {
      const err = document.getElementById('err-capacity');
      if (err) err.textContent = 'Capacity must be at least 1.';
      hasError = true;
    }

    if (hasError) return;

    // Find position
    const pos = findAvailablePosition(zone);
    const newId = 't-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);

    const newTable = {
      id: newId,
      cafeId: 'cafe-001',
      label: label,
      capacity: capacity,
      type: type,
      zone: zone,
      status: status,
      posX: pos.x,
      posY: pos.y
    };

    seatingTables.push(newTable);
    closeAddModal();

    // If new table is in another zone, switch to it so user sees it
    if (currentZone !== zone) {
      currentZone = zone;
      if (zoneSelectEl) zoneSelectEl.value = zone;
    }

    selectedTableId = newId;
    renderFloorPlan();
    renderTableDetails();

    if (typeof showAdminToast === 'function') {
      showAdminToast(`Table ${newTable.label} added to ${zone}`);
    }
  }

  /* ── Safe HTML Escaper ── */
  function escapeHtml(str) {
    if (typeof _escHtml === 'function') return _escHtml(str);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ── Initialization ── */
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Render Administrator Shell with Seating active
    if (typeof renderShell === 'function') {
      renderShell('seating');
    }

    // 2. Clone initial seed data
    if (Array.isArray(window.ADMIN_SEATING_TABLES)) {
      seatingTables = JSON.parse(JSON.stringify(window.ADMIN_SEATING_TABLES));
    } else {
      seatingTables = [];
    }

    // 3. Cache DOM elements
    canvasEl = document.getElementById('floor-plan-canvas');
    zoneSelectEl = document.getElementById('zone-select');
    detailsPanelEl = document.getElementById('table-details-panel');
    btnAddTableEl = document.getElementById('btn-add-table');
    modalAddTableEl = document.getElementById('modal-add-table');
    formAddTableEl = document.getElementById('form-add-table');
    btnCloseModalEl = document.getElementById('btn-modal-close');
    btnCancelModalEl = document.getElementById('btn-modal-cancel');

    // 4. Zone Change Listener
    if (zoneSelectEl) {
      zoneSelectEl.addEventListener('change', (e) => {
        currentZone = e.target.value;
        // Check if selected table is in this zone
        const inZone = seatingTables.filter(t => t.zone === currentZone);
        if (inZone.length > 0) {
          const match = inZone.find(t => t.id === selectedTableId);
          selectedTableId = match ? match.id : inZone[0].id;
        } else {
          selectedTableId = null;
        }
        renderFloorPlan();
        renderTableDetails();
      });
    }

    // 5. Add Table Modal Handlers
    if (btnAddTableEl) btnAddTableEl.addEventListener('click', openAddModal);
    if (btnCloseModalEl) btnCloseModalEl.addEventListener('click', closeAddModal);
    if (btnCancelModalEl) btnCancelModalEl.addEventListener('click', closeAddModal);
    if (formAddTableEl) formAddTableEl.addEventListener('submit', handleAddTableSubmit);

    // Modal background click & escape key
    if (modalAddTableEl) {
      modalAddTableEl.addEventListener('click', (e) => {
        if (e.target === modalAddTableEl) closeAddModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalAddTableEl && !modalAddTableEl.hasAttribute('hidden')) {
        closeAddModal();
      }
    });

    // 6. Initial render
    renderFloorPlan();
    renderTableDetails();
  });

})();
