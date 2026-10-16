/**
 * CaféNest Administrator — Table Status Script
 * Renders responsive table status cards, handles zone filtering and selection feedback.
 */

(function () {
  'use strict';

  /* ── State ── */
  let tablesList = [];
  let selectedZone = 'Indoor';
  let selectedTableId = null;

  /* ── DOM References ── */
  let gridContainerEl;
  let zoneSelectEl;

  /* ── Table Icon SVG ── */
  const TABLE_ICON_SVG = `
    <svg class="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="6" y1="9" x2="18" y2="9"/>
      <line x1="8" y1="9" x2="8" y2="19"/>
      <line x1="16" y1="9" x2="16" y2="19"/>
      <path d="M3 6v10M3 13h3"/>
      <path d="M21 6v10M18 13h3"/>
    </svg>
  `;

  /* ── Reusable Card Template Function ── */
  function createTableCardHTML(table) {
    const isSelected = selectedTableId === table.id;
    const statusClass = 'badge-' + table.status.toLowerCase();

    return `
      <button type="button"
        class="table-card-item${isSelected ? ' is-selected' : ''}"
        data-id="${escapeHtml(table.id)}"
        data-status="${escapeHtml(table.status)}"
        aria-pressed="${isSelected ? 'true' : 'false'}"
        aria-label="Table ${escapeHtml(table.label)}, Capacity ${escapeHtml(String(table.capacity))}, Status ${escapeHtml(table.status)}">
        <div class="table-icon-circle" aria-hidden="true">
          ${TABLE_ICON_SVG}
        </div>
        <div class="table-info-stack">
          <span class="table-id-label">${escapeHtml(table.label)}</span>
          <span class="table-capacity-text">Capacity: ${escapeHtml(String(table.capacity))}</span>
          <span class="table-status-badge ${statusClass}">${escapeHtml(table.status)}</span>
        </div>
      </button>
    `;
  }

  /* ── Render Grid Function ── */
  function renderGrid() {
    if (!gridContainerEl) return;

    const filteredTables = tablesList.filter(t => t.zone === selectedZone);

    if (filteredTables.length === 0) {
      gridContainerEl.innerHTML = `
        <div class="zone-empty-box" role="region" aria-label="No tables empty state">
          <svg class="zone-empty-icon" viewBox="0 0 24 24" aria-hidden="true">
            <line x1="6" y1="9" x2="18" y2="9"/>
            <line x1="8" y1="9" x2="8" y2="19"/>
            <line x1="16" y1="9" x2="16" y2="19"/>
            <path d="M3 6v10M3 13h3"/>
            <path d="M21 6v10M18 13h3"/>
          </svg>
          <h3 class="zone-empty-title">No tables found in this seating area</h3>
          <p class="zone-empty-desc">There are currently no tables configured for the ${escapeHtml(selectedZone)} zone.</p>
          <button type="button" class="btn-switch-indoor" id="btn-switch-indoor">Switch to Indoor</button>
        </div>
      `;

      const btnSwitch = gridContainerEl.querySelector('#btn-switch-indoor');
      if (btnSwitch) {
        btnSwitch.addEventListener('click', () => {
          selectedZone = 'Indoor';
          if (zoneSelectEl) zoneSelectEl.value = 'Indoor';
          renderGrid();
        });
      }
      return;
    }

    gridContainerEl.innerHTML = filteredTables.map(t => createTableCardHTML(t)).join('');

    // Attach card click handlers
    gridContainerEl.querySelectorAll('.table-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        handleCardClick(id);
      });
    });
  }

  /* ── Card Selection Interaction ── */
  function handleCardClick(id) {
    selectedTableId = id;
    const table = tablesList.find(t => t.id === id);
    if (!table) return;

    // Update selection highlight across all cards
    gridContainerEl.querySelectorAll('.table-card-item').forEach(card => {
      const isCardSelected = card.dataset.id === id;
      card.classList.toggle('is-selected', isCardSelected);
      card.setAttribute('aria-pressed', isCardSelected ? 'true' : 'false');
    });

    // Provide accessible feedback toast
    if (typeof showAdminToast === 'function') {
      showAdminToast(`Table ${table.label} • Capacity: ${table.capacity} • Zone: ${table.zone} • Status: ${table.status}`);
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
    // 1. Render Admin Shell with tableStatus active
    if (typeof renderShell === 'function') {
      renderShell('tableStatus');
    }

    // 2. Clone initial seed data
    if (Array.isArray(window.ADMIN_TABLES)) {
      tablesList = JSON.parse(JSON.stringify(window.ADMIN_TABLES));
    } else {
      tablesList = [];
    }

    // 3. Cache DOM elements
    gridContainerEl = document.getElementById('table-status-grid');
    zoneSelectEl = document.getElementById('zone-select');

    // 4. Zone Filter Listener
    if (zoneSelectEl) {
      zoneSelectEl.addEventListener('change', (e) => {
        selectedZone = e.target.value;
        selectedTableId = null;
        renderGrid();
      });
    }

    // 5. Initial Grid Render
    renderGrid();
  });

})();
