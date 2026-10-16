/**
 * CaféNest Administrator — Customer Reviews Script
 * Renders rating summary cards, distribution progress bars, review cards,
 * and handles the reply interaction modal with toast feedback.
 */

(function () {
  'use strict';

  /* ── State ── */
  let summaryData = null;
  let reviewsList = [];
  let activeReplyReviewId = null;

  /* ── DOM References ── */
  let summaryCardsContainerEl;
  let reviewsListContainerEl;
  let modalReplyEl;
  let formReplyEl;
  let replyTextareaEl;
  let replyQuotePreviewEl;
  let replyModalTitleEl;

  /* ── Star SVG Helper ── */
  function renderStarsHTML(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      html += `
        <svg class="star-mini ${isFilled ? 'filled' : 'unfilled'}" viewBox="0 0 24 24" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      `;
    }
    return html;
  }

  /* ── Render Summary Cards (Average + Distribution) ── */
  function renderSummaryCards() {
    if (!summaryCardsContainerEl || !summaryData) return;

    // Card A: Average Rating
    const cardA_HTML = `
      <div class="card-rating-avg" role="region" aria-label="Average rating summary">
        <svg class="star-hero-icon" viewBox="0 0 24 24" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <div class="rating-avg-info">
          <span class="rating-avg-number">${summaryData.averageRating.toFixed(1)}</span>
          <span class="rating-avg-label">Average Rating</span>
          <span class="rating-avg-count">Based on ${summaryData.totalReviews} reviews</span>
        </div>
      </div>
    `;

    // Card B: Rating Distribution
    const maxCount = Math.max(...summaryData.distribution.map(d => d.count), 1);

    const distRowsHTML = summaryData.distribution.map(d => {
      const percentage = Math.round((d.count / maxCount) * 100);
      const fillClass = d.stars >= 4 ? 'bar-dark' : 'bar-amber';

      return `
        <div class="dist-row">
          <span class="dist-stars-label">
            ${d.stars}
            <svg class="dist-star-icon" viewBox="0 0 24 24" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </span>
          <div class="dist-bar-track" aria-hidden="true">
            <div class="dist-bar-fill ${fillClass}" style="width: ${percentage}%;"></div>
          </div>
          <span class="dist-count">${d.count}</span>
        </div>
      `;
    }).join('');

    const cardB_HTML = `
      <div class="card-rating-dist" role="region" aria-label="Rating distribution breakdown">
        ${distRowsHTML}
      </div>
    `;

    summaryCardsContainerEl.innerHTML = cardA_HTML + cardB_HTML;
  }

  /* ── Render Customer Reviews List ── */
  function renderReviewsList() {
    if (!reviewsListContainerEl) return;

    reviewsListContainerEl.innerHTML = reviewsList.map(rev => {
      const starsHTML = renderStarsHTML(rev.rating);

      let ownerReplyHTML = '';
      if (rev.reply) {
        ownerReplyHTML = `
          <div class="review-owner-reply-box">
            <span class="reply-badge-header">Owner Response</span>
            <p class="reply-text">${escapeHtml(rev.reply)}</p>
          </div>
        `;
      }

      return `
        <article class="review-card-item" data-id="${escapeHtml(rev.id)}">
          <div class="review-card-main">
            <div class="review-user-group">
              <div class="review-avatar" style="background-color: ${rev.avatarBg}; color: ${rev.avatarColor};" aria-hidden="true">
                ${escapeHtml(rev.initials)}
              </div>
              <div class="review-content-stack">
                <h3 class="review-author-name">${escapeHtml(rev.customerName)}</h3>
                <div class="review-meta-line">
                  <span>${escapeHtml(rev.date)}</span>
                  <span class="review-dot-sep">•</span>
                  <span class="review-rating-num">${rev.rating}</span>
                  <span class="review-stars-group" aria-label="${rev.rating} out of 5 stars">
                    ${starsHTML}
                  </span>
                </div>
                <p class="review-comment-text">${escapeHtml(rev.comment)}</p>
                ${ownerReplyHTML}
              </div>
            </div>

            <button type="button" class="btn-review-reply" data-id="${escapeHtml(rev.id)}" aria-label="Reply to ${escapeHtml(rev.customerName)}'s review">
              Reply
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listeners to reply buttons
    reviewsListContainerEl.querySelectorAll('.btn-review-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        openReplyModal(id);
      });
    });
  }

  /* ── Open Reply Modal ── */
  function openReplyModal(id) {
    const rev = reviewsList.find(r => r.id === id);
    if (!rev || !modalReplyEl) return;

    activeReplyReviewId = id;

    if (replyModalTitleEl) {
      replyModalTitleEl.textContent = `Reply to ${rev.customerName}`;
    }

    if (replyQuotePreviewEl) {
      replyQuotePreviewEl.textContent = `"${rev.comment}"`;
    }

    if (replyTextareaEl) {
      replyTextareaEl.value = rev.reply || '';
      setTimeout(() => replyTextareaEl.focus(), 50);
    }

    modalReplyEl.removeAttribute('hidden');
  }

  function closeReplyModal() {
    if (!modalReplyEl) return;
    modalReplyEl.setAttribute('hidden', '');
    activeReplyReviewId = null;
    if (formReplyEl) formReplyEl.reset();
  }

  /* ── Handle Reply Form Submit ── */
  function handleReplySubmit(e) {
    e.preventDefault();
    if (!activeReplyReviewId) return;

    const rev = reviewsList.find(r => r.id === activeReplyReviewId);
    if (!rev) return;

    const text = replyTextareaEl ? replyTextareaEl.value.trim() : '';
    if (!text) return;

    rev.reply = text;
    closeReplyModal();
    renderReviewsList();

    if (typeof showAdminToast === 'function') {
      showAdminToast(`Reply sent to ${rev.customerName}`);
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
    // 1. Render Admin Shell with reviews active
    if (typeof renderShell === 'function') {
      renderShell('reviews');
    }

    // 2. Clone initial seed data
    if (typeof window.ADMIN_REVIEWS_SUMMARY === 'object') {
      summaryData = JSON.parse(JSON.stringify(window.ADMIN_REVIEWS_SUMMARY));
    }
    if (Array.isArray(window.ADMIN_REVIEWS)) {
      reviewsList = JSON.parse(JSON.stringify(window.ADMIN_REVIEWS));
    }

    // 3. Cache DOM elements
    summaryCardsContainerEl = document.getElementById('reviews-summary-cards');
    reviewsListContainerEl = document.getElementById('reviews-list-container');
    modalReplyEl = document.getElementById('modal-reply');
    formReplyEl = document.getElementById('form-reply');
    replyTextareaEl = document.getElementById('reply-text');
    replyQuotePreviewEl = document.getElementById('reply-quote-preview');
    replyModalTitleEl = document.getElementById('modal-reply-title');

    // 4. Modal Event Listeners
    if (formReplyEl) {
      formReplyEl.addEventListener('submit', handleReplySubmit);
    }

    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      const closeBtn = modal.querySelector('.btn-modal-close');
      if (closeBtn) closeBtn.addEventListener('click', closeReplyModal);

      const cancelBtn = modal.querySelector('.btn-modal-cancel');
      if (cancelBtn) cancelBtn.addEventListener('click', closeReplyModal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeReplyModal();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalReplyEl && !modalReplyEl.hasAttribute('hidden')) {
        closeReplyModal();
      }
    });

    // 5. Initial Render
    renderSummaryCards();
    renderReviewsList();
  });

})();
