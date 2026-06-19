/**
 * Event Coordinator Module
 * Binds DOM event listeners, handles scrolling pagination, and configures keyboard shortcuts.
 */
import { state } from './state.js';
import { renderGrid, loadMoreNotes, showToast, openDetails } from './ui.js';
import { copyToClipboard, formatAsMarkdown, formatAsHtml, exportToJSON, exportToCSV, exportToPDF } from './exports.js';
import { fetchReleaseNotes } from './api.js';

// DOM selectors caches
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const filterPills = document.querySelectorAll('.pill');
const refreshBtn = document.getElementById('refresh-btn');
const errorRetryBtn = document.getElementById('error-retry-btn');

// Export Selectors
const copyMarkdownBtn = document.getElementById('copy-markdown-btn');
const copyHtmlBtn = document.getElementById('copy-html-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');

// Detail Drawer Selectors
const detailDrawer = document.getElementById('detail-drawer');
const tweetBtn = document.getElementById('tweet-btn');
const tweetTextarea = document.getElementById('tweet-textarea');
const copyTweetBtn = document.getElementById('copy-tweet-btn');

// Card layout toggle buttons
const layoutGridBtn = document.getElementById('layout-grid-btn');
const layoutListBtn = document.getElementById('layout-list-btn');

// ==========================================================================
// Keyboard Navigation & Shortcuts Coordinator
// ==========================================================================
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 1. Search Focus Shortcut (/)
    if (e.key === '/' && document.activeElement !== searchInput && !isInputElement(document.activeElement)) {
      e.preventDefault();
      searchInput.focus();
      showToast('Search bar focused (Type search term)', 'info', 1500);
      return;
    }
    
    // 2. Active note shortcuts (when drawer modal is open)
    if (detailDrawer && detailDrawer.hasAttribute('open')) {
      const selected = state.selectedNote;
      if (!selected) return;
      
      // Close Modal (Esc) - Natively handled but we hook for state updates
      
      // Favorite active note (F)
      if (e.key.toLowerCase() === 'f' && !isInputElement(document.activeElement)) {
        e.preventDefault();
        const favBtn = document.querySelector(`.note-card[data-id="${selected.id}"] .btn-card-fav`);
        state.toggleBookmark(selected.id);
        
        // Synchronize state visually in UI
        if (favBtn) {
          const isFavNow = state.isBookmarked(selected.id);
          const svg = favBtn.querySelector('svg');
          if (isFavNow) {
            favBtn.classList.add('active');
            svg.setAttribute('fill', 'currentColor');
            showToast('Release bookmarked!', 'success');
          } else {
            favBtn.classList.remove('active');
            svg.setAttribute('fill', 'none');
            showToast('Bookmark removed.', 'info');
          }
        }
      }
      
      // Share on X/Twitter (S)
      if (e.key.toLowerCase() === 's' && !isInputElement(document.activeElement)) {
        e.preventDefault();
        tweetBtn.click();
      }
      
      return;
    }
    
    // 3. Grid Navigation Shortcuts (Arrow keys)
    if (!isInputElement(document.activeElement)) {
      handleGridArrows(e);
    }
  });
}

function isInputElement(el) {
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
}

function handleGridArrows(e) {
  const cards = [...document.querySelectorAll('.note-card')];
  if (cards.length === 0) return;
  
  const activeCardIndex = cards.findIndex(card => card === document.activeElement);
  
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    const nextIdx = (activeCardIndex + 1) % cards.length;
    cards[nextIdx].focus();
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    const prevIdx = activeCardIndex <= 0 ? cards.length - 1 : activeCardIndex - 1;
    cards[prevIdx].focus();
  }
}

// ==========================================================================
// Scroll Infinite Pagination Handler
// ==========================================================================
function setupInfiniteScroll() {
  window.addEventListener('scroll', () => {
    // Check if scrolled near the bottom (within 120px)
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 120) {
      loadMoreNotes();
    }
  });
}

// ==========================================================================
// Binding Toolbar Filters & Actions
// ==========================================================================
export function initEventListeners(onRefreshCallback) {
  // Search input change events
  searchInput?.addEventListener('input', (e) => {
    state.setSearchQuery(e.target.value);
    if (clearSearchBtn) {
      clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
    }
    renderGrid(true);
  });
  
  clearSearchBtn?.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
      state.setSearchQuery('');
      clearSearchBtn.style.display = 'none';
      searchInput.focus();
      renderGrid(true);
    }
  });
  
  // Date Picker filters
  const dateStartInput = document.getElementById('date-start');
  const dateEndInput = document.getElementById('date-end');
  
  const handleDateFilter = () => {
    state.setDateRange(dateStartInput?.value, dateEndInput?.value);
    renderGrid(true);
  };
  
  dateStartInput?.addEventListener('change', handleDateFilter);
  dateEndInput?.addEventListener('change', handleDateFilter);
  
  // Filter pills selection
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      // Toggle CSS selection class (support multi-select state values)
      const filterType = pill.getAttribute('data-type');
      
      if (filterType === 'all') {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      } else {
        document.querySelector('.pill[data-type="all"]')?.classList.remove('active');
        pill.classList.toggle('active');
        
        // If all other pills are deselected, fall back to "All"
        const activePills = [...filterPills].filter(p => p.classList.contains('active') && p.getAttribute('data-type') !== 'all');
        if (activePills.length === 0) {
          document.querySelector('.pill[data-type="all"]')?.classList.add('active');
        }
      }
      
      state.toggleTypeFilter(filterType);
      renderGrid(true);
    });
  });
  
  // Layout toggles grid/list modes
  layoutGridBtn?.addEventListener('click', () => {
    layoutGridBtn.classList.add('active');
    layoutListBtn.classList.remove('active');
    import('./ui.js').then(ui => ui.setCardLayoutMode('grid'));
    renderGrid(true);
  });
  
  layoutListBtn?.addEventListener('click', () => {
    layoutListBtn.classList.add('active');
    layoutGridBtn.classList.remove('active');
    import('./ui.js').then(ui => ui.setCardLayoutMode('list'));
    renderGrid(true);
  });
  
  // Refresh click listeners
  refreshBtn?.addEventListener('click', onRefreshCallback);
  errorRetryBtn?.addEventListener('click', onRefreshCallback);
  
  // ==========================================================================
  // Drawer & Sharing Listeners
  // ==========================================================================
  copyTweetBtn?.addEventListener('click', () => {
    copyToClipboard(tweetTextarea.value)
      .then(() => showToast('Tweet draft copied to clipboard!', 'success'))
      .catch(() => showToast('Failed to copy tweet text.', 'error'));
  });
  
  tweetBtn?.addEventListener('click', () => {
    const text = tweetTextarea.value;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
  
  // Dynamic Web Share API trigger
  const shareBtn = document.getElementById('web-share-btn');
  shareBtn?.addEventListener('click', () => {
    const note = state.selectedNote;
    if (!note) return;
    
    if (navigator.share) {
      navigator.share({
        title: `BigQuery Release: ${note.type}`,
        text: note.plain_text,
        url: note.link || window.location.href
      })
        .then(() => showToast('Shared successfully!', 'success'))
        .catch((err) => console.log('Share canceled:', err));
    } else {
      // Fallback: Copy Markdown and notify
      copyToClipboard(formatAsMarkdown(note))
        .then(() => showToast('Web Share not supported. Copied Markdown format instead!', 'info'))
        .catch(() => showToast('Clipboard action blocked.', 'error'));
    }
  });

  // Drawer Export features
  copyMarkdownBtn?.addEventListener('click', () => {
    if (state.selectedNote) {
      copyToClipboard(formatAsMarkdown(state.selectedNote))
        .then(() => showToast('Markdown formatted release copied!', 'success'))
        .catch(() => showToast('Clipboard write failed', 'error'));
    }
  });

  copyHtmlBtn?.addEventListener('click', () => {
    if (state.selectedNote) {
      copyToClipboard(formatAsHtml(state.selectedNote))
        .then(() => showToast('HTML structure copied!', 'success'))
        .catch(() => showToast('Clipboard write failed', 'error'));
    }
  });
  
  // Batch exports buttons
  exportJsonBtn?.addEventListener('click', () => {
    if (state.filteredNotes.length === 0) {
      showToast('No notes filtered to export.', 'warning');
      return;
    }
    exportToJSON(state.filteredNotes);
    showToast(`Exported ${state.filteredNotes.length} notes to JSON.`, 'success');
  });
  
  exportCsvBtn?.addEventListener('click', () => {
    if (state.filteredNotes.length === 0) {
      showToast('No notes filtered to export.', 'warning');
      return;
    }
    exportToCSV(state.filteredNotes);
    showToast(`Exported ${state.filteredNotes.length} notes to CSV.`, 'success');
  });
  
  exportPdfBtn?.addEventListener('click', () => {
    exportToPDF();
  });
  
  // Drawer Tab toggling
  const tabButtons = document.querySelectorAll('.drawer-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`tab-${targetTab}`)?.classList.add('active');
    });
  });

  // Setup keyboard binds & paging scrolls
  setupKeyboardShortcuts();
  setupInfiniteScroll();
}
