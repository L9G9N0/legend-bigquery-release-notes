/**
 * UI Renderer Module
 * Handles DOM rendering, skeleton loaders, drawer contents, tabs, and notifications.
 */
import { state } from './state.js';
import { copyToClipboard, formatAsMarkdown, formatAsHtml, exportToJSON, exportToCSV, exportToPDF } from './exports.js';
import { requestAiAnalysis } from './api.js';

// Client-side XSS Protection wrapper using DOMPurify
function safeHtml(htmlString) {
  if (typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(htmlString);
  }
  return htmlString; // Fallback if offline / blocked
}

// DOM selectors caches
const notesGrid = document.getElementById('notes-grid');
const resultsCount = document.getElementById('results-count');
const cacheTimeSpan = document.getElementById('cache-time');
const noResultsDiv = document.getElementById('no-results');
const toastContainer = document.getElementById('toast-container');

// Drawer selectors
const detailDrawer = document.getElementById('detail-drawer');
const drawerBadge = document.getElementById('drawer-badge');
const drawerDate = document.getElementById('drawer-date');
const drawerHtmlContent = document.getElementById('drawer-html-content');
const drawerSourceLink = document.getElementById('drawer-source-link');
const tweetTextarea = document.getElementById('tweet-textarea');
const charCounter = document.getElementById('char-counter');
const charWarning = document.getElementById('char-warning');

// Pagination State
const BATCH_SIZE = 15;
let currentOffset = BATCH_SIZE;

// Card Layout: 'grid' or 'list'
let cardLayoutMode = 'grid';

// ==========================================================================
// Toast Alerts Stack
// ==========================================================================
export function showToast(message, type = 'info', duration = 3500) {
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Dismiss message">&times;</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Close on click
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 1rem)';
    setTimeout(() => toast.remove(), 250);
  });
  
  // Auto-fading timeout
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 1rem)';
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }
  }, duration);
}

// ==========================================================================
// Card Layout Mode Controls
// ==========================================================================
export function setCardLayoutMode(mode) {
  cardLayoutMode = mode;
  if (notesGrid) {
    if (mode === 'list') {
      notesGrid.classList.add('list-layout');
      notesGrid.classList.remove('grid-layout');
    } else {
      notesGrid.classList.add('grid-layout');
      notesGrid.classList.remove('list-layout');
    }
  }
}

// ==========================================================================
// Rendering Note Grid & Infinite Scroll
// ==========================================================================
export function renderGrid(resetPagination = true) {
  if (!notesGrid) return;
  
  if (resetPagination) {
    notesGrid.innerHTML = '';
    currentOffset = BATCH_SIZE;
  }
  
  const notesToRender = state.filteredNotes.slice(0, currentOffset);
  const totalFilteredCount = state.filteredNotes.length;
  
  // Update counts
  const typeText = state.filters.types.has('all') ? 'Release Notes' : 'Selected Type Updates';
  resultsCount.innerText = `${totalFilteredCount} ${typeText} Found`;
  
  if (totalFilteredCount === 0) {
    noResultsDiv.style.display = 'flex';
    return;
  }
  
  noResultsDiv.style.display = 'none';
  
  // If loading more, append only new cards
  const existingCardsCount = notesGrid.querySelectorAll('.note-card').length;
  const nextSlice = notesToRender.slice(existingCardsCount);
  
  const fragment = document.createDocumentFragment();
  
  nextSlice.forEach(note => {
    const isFav = state.isBookmarked(note.id);
    const card = document.createElement('article');
    card.className = `note-card ${cardLayoutMode === 'list' ? 'list-card' : ''}`;
    card.setAttribute('data-type-color', note.type.toLowerCase());
    card.setAttribute('data-id', note.id);
    card.setAttribute('tabindex', '0');
    
    card.innerHTML = `
      <div class="card-header-row">
        <span class="card-date">${note.date}</span>
        <div class="card-actions-wrapper">
          <button class="btn-card-fav ${isFav ? 'active' : ''}" aria-label="${isFav ? 'Remove bookmark' : 'Bookmark release note'}">
            <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
          <span class="badge ${note.type.toLowerCase()}">${note.type}</span>
        </div>
      </div>
      <div class="card-body-content">
        ${safeHtml(note.html)}
      </div>
      <div class="card-footer-row">
        <span class="read-more-text">
          <span>Explore Details</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </div>
    `;
    
    // Add Click listener for details opening
    card.addEventListener('click', (e) => {
      // If clicking the favorite button, ignore card opening
      if (e.target.closest('.btn-card-fav')) {
        e.stopPropagation();
        toggleCardBookmark(note.id, card.querySelector('.btn-card-fav'));
        return;
      }
      openDetails(note);
    });
    
    // Accessibility keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetails(note);
      }
    });
    
    fragment.appendChild(card);
  });
  
  notesGrid.appendChild(fragment);
}

function toggleCardBookmark(noteId, buttonEl) {
  const isFavNow = state.toggleBookmark(noteId);
  const svg = buttonEl.querySelector('svg');
  if (isFavNow) {
    buttonEl.classList.add('active');
    svg.setAttribute('fill', 'currentColor');
    showToast('Release bookmarked to local storage!', 'success');
  } else {
    buttonEl.classList.remove('active');
    svg.setAttribute('fill', 'none');
    showToast('Bookmark removed.', 'info');
  }
}

export function loadMoreNotes() {
  if (currentOffset >= state.filteredNotes.length) return;
  currentOffset += BATCH_SIZE;
  renderGrid(false);
}

// ==========================================================================
// Details Drawer Handler & AI Tab Updates
// ==========================================================================
export function openDetails(note) {
  state.selectedNote = note;
  state.addHistory(note);
  
  // Details Populate
  drawerBadge.className = `badge ${note.type.toLowerCase()}`;
  drawerBadge.innerText = note.type;
  drawerDate.innerText = note.date;
  
  // HTML Content
  drawerHtmlContent.innerHTML = safeHtml(note.html);
  drawerSourceLink.href = note.link || 'https://cloud.google.com/bigquery/docs/release-notes';
  
  // Reset tweet content draft
  const defaultUrl = note.link || 'https://cloud.google.com/bigquery';
  const prefix = `📢 BigQuery ${note.type} Update (${note.date}): `;
  const suffix = `\n\nLink: ${defaultUrl}\n#GoogleCloud`;
  const maxExcerpt = 280 - (prefix.length + 23 + suffix.length - defaultUrl.length); // X normalizes URLs to 23 chars
  
  let excerpt = note.plain_text;
  if (excerpt.length > maxExcerpt) {
    excerpt = excerpt.substring(0, maxExcerpt - 3) + '...';
  }
  tweetTextarea.value = `${prefix}${excerpt}${suffix}`;
  updateTweetLength();
  
  // Reset AI tabs contents to default template
  resetAiTabs();
  
  // Open modal
  detailDrawer.showModal();
}

function updateTweetLength() {
  const text = tweetTextarea.value;
  const urlRegex = /https?:\/\/[^\s]+/g;
  let len = text.length;
  
  const urls = text.match(urlRegex);
  if (urls) {
    urls.forEach(url => {
      len = len - url.length + 23;
    });
  }
  
  charCounter.innerText = `${len} / 280`;
  charCounter.className = 'char-counter';
  charWarning.style.display = 'none';
  
  if (len > 280) {
    charCounter.classList.add('danger');
    charWarning.style.display = 'block';
  } else if (len > 250) {
    charCounter.classList.add('warning');
  }
}

function resetAiTabs() {
  const aiContentArea = document.getElementById('ai-summary-output');
  if (aiContentArea) {
    aiContentArea.innerHTML = `
      <div class="ai-empty-state">
        <svg class="sparkles-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
        </svg>
        <h4>AI-Powered Release Analysis</h4>
        <p>Analyze this update with Google Gemini to generate custom summaries, tech impact analysis, developer checklists, or social copies.</p>
        <button id="btn-generate-ai" class="btn btn-primary btn-sm">Generate Analysis</button>
      </div>
    `;
    
    const runBtn = aiContentArea.querySelector('#btn-generate-ai');
    if (runBtn) {
      runBtn.addEventListener('click', generateAiInsights);
    }
  }
}

async function generateAiInsights() {
  const output = document.getElementById('ai-summary-output');
  if (!output || !state.selectedNote) return;
  
  // Show Spinner loader
  output.innerHTML = `
    <div class="ai-loader">
      <svg class="spinner-icon loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </svg>
      <span>Contacting Gemini AI Engine...</span>
    </div>
  `;
  
  try {
    const note = state.selectedNote;
    const mode = document.getElementById('ai-mode-selector')?.value || 'summary';
    const length = document.getElementById('ai-length-selector')?.value || 'medium';
    
    const analysis = await requestAiAnalysis(note.id, note.plain_text, note.date, note.type, mode, length);
    
    // Parse formatting (support markdown titles or lines if returned)
    output.innerHTML = `
      <div class="ai-result-content">
        <div class="ai-result-header">
          <h5>Gemini Analysis (${mode})</h5>
          <button id="copy-ai-btn" class="btn btn-outline btn-sm">Copy Analysis</button>
        </div>
        <div class="ai-body-text">${analysis.result.replace(/\n/g, '<br>')}</div>
      </div>
    `;
    
    document.getElementById('copy-ai-btn')?.addEventListener('click', () => {
      copyToClipboard(analysis.result)
        .then(() => showToast('AI analysis copied to clipboard!', 'success'))
        .catch(() => showToast('Failed to copy text', 'error'));
    });
    
  } catch (error) {
    showToast(`AI Analysis Failed: ${error.message}`, 'error');
    resetAiTabs();
  }
}

// Watch character counts on textarea edits
tweetTextarea?.addEventListener('input', updateTweetLength);
