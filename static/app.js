// ==========================================================================
// Application State
// ==========================================================================
let allNotes = [];
let filteredNotes = [];
let selectedNote = null;
let currentTypeFilter = 'all';
let currentSearchQuery = '';

// DOM Elements
const notesGrid = document.getElementById('notes-grid');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const filterPills = document.querySelectorAll('.pill');
const refreshBtn = document.getElementById('refresh-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const resultsCount = document.getElementById('results-count');
const cacheTimeSpan = document.getElementById('cache-time');
const noResultsDiv = document.getElementById('no-results');
const errorBanner = document.getElementById('error-banner');
const errorRetryBtn = document.getElementById('error-retry-btn');
const toastContainer = document.getElementById('toast-container');

// Drawer DOM Elements
const detailDrawer = document.getElementById('detail-drawer');
const drawerCloseBtn = document.getElementById('drawer-close');
const drawerBadge = document.getElementById('drawer-badge');
const drawerDate = document.getElementById('drawer-date');
const drawerHtmlContent = document.getElementById('drawer-html-content');
const drawerSourceLink = document.getElementById('drawer-source-link');
const tweetTextarea = document.getElementById('tweet-textarea');
const charCounter = document.getElementById('char-counter');
const charWarning = document.getElementById('char-warning');
const copyTweetBtn = document.getElementById('copy-tweet-btn');
const tweetBtn = document.getElementById('tweet-btn');

// ==========================================================================
// Theme Management
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }
}

themeToggleBtn.addEventListener('click', () => {
  if (document.body.classList.contains('dark-theme')) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
    showToast('Switched to light theme', 'info');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    showToast('Switched to dark theme', 'info');
  }
});

// ==========================================================================
// Toast Notification System
// ==========================================================================
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 1rem)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// ==========================================================================
// Data Fetching & Refreshing
// ==========================================================================
async function fetchReleaseNotes(forceRefresh = false) {
  // Show Loading States
  toggleLoadingState(true);
  errorBanner.style.display = 'none';
  noResultsDiv.style.display = 'none';
  
  // Render skeletons inside notes grid
  notesGrid.innerHTML = Array(6).fill('<div class="skeleton-card"></div>').join('');
  
  const url = `/api/notes${forceRefresh ? '?refresh=true' : ''}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message);
    }
    
    allNotes = data.notes || [];
    
    // Set cache time display
    if (data.cached_at) {
      const cacheDate = new Date(data.cached_at * 1000);
      cacheTimeSpan.innerText = `Updated: ${cacheDate.toLocaleTimeString()}`;
    }
    
    if (data.status === 'warning') {
      showToast(data.message, 'error', 5000);
    } else if (forceRefresh) {
      showToast('Release notes refreshed successfully!', 'success');
    }
    
    applyFilters();
    
  } catch (error) {
    console.error('Fetch error:', error);
    showToast(`Error: ${error.message}`, 'error', 5000);
    
    // Display error banner
    errorBanner.style.display = 'flex';
    notesGrid.innerHTML = '';
    resultsCount.innerText = 'Error';
  } finally {
    toggleLoadingState(false);
  }
}

function toggleLoadingState(isLoading) {
  if (isLoading) {
    refreshBtn.classList.add('loading');
    refreshBtn.disabled = true;
  } else {
    refreshBtn.classList.remove('loading');
    refreshBtn.disabled = false;
  }
}

// ==========================================================================
// Filtering & Search Logic
// ==========================================================================
function applyFilters() {
  filteredNotes = allNotes.filter(note => {
    // 1. Filter by category type
    const matchesType = currentTypeFilter === 'all' || 
                        note.type.toLowerCase() === currentTypeFilter.toLowerCase();
    
    // 2. Filter by search query
    const searchLower = currentSearchQuery.toLowerCase();
    const matchesSearch = !currentSearchQuery || 
                          note.date.toLowerCase().includes(searchLower) ||
                          note.type.toLowerCase().includes(searchLower) ||
                          note.plain_text.toLowerCase().includes(searchLower) ||
                          note.html.toLowerCase().includes(searchLower);
                          
    return matchesType && matchesSearch;
  });
  
  renderNotes();
}

function renderNotes() {
  notesGrid.innerHTML = '';
  
  // Update count
  const count = filteredNotes.length;
  const typeText = currentTypeFilter === 'all' ? 'Release Notes' : `${currentTypeFilter}s`;
  resultsCount.innerText = `${count} ${typeText} Found`;
  
  if (count === 0) {
    noResultsDiv.style.display = 'flex';
    return;
  }
  
  noResultsDiv.style.display = 'none';
  
  // Render cards
  filteredNotes.forEach(note => {
    const card = document.createElement('article');
    card.className = 'note-card';
    card.setAttribute('data-type-color', note.type.toLowerCase());
    card.setAttribute('tabindex', '0'); // Make focusable
    
    card.innerHTML = `
      <div class="card-header-row">
        <span class="card-date">${note.date}</span>
        <span class="badge ${note.type.toLowerCase()}">${note.type}</span>
      </div>
      <div class="card-body-content">
        ${note.html}
      </div>
      <div class="card-footer-row">
        <span class="read-more-text">
          <span>Read & Share</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </div>
    `;
    
    // Click event to open details
    card.addEventListener('click', () => openDetailDrawer(note));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetailDrawer(note);
      }
    });
    
    notesGrid.appendChild(card);
  });
}

// ==========================================================================
// Details Drawer & Tweet Composition
// ==========================================================================
function openDetailDrawer(note) {
  selectedNote = note;
  
  // Populate drawer contents
  drawerBadge.className = `badge ${note.type.toLowerCase()}`;
  drawerBadge.innerText = note.type;
  drawerDate.innerText = note.date;
  drawerHtmlContent.innerHTML = note.html;
  drawerSourceLink.href = note.link;
  
  // Compose default Tweet draft
  // Standard limits: tweet character count has complex rules for URLs (which are weighted as 23 chars).
  // We'll calculate: plain text excerpt + link + hashtags
  const cleanUrl = note.link || 'https://cloud.google.com/bigquery';
  const prefix = `📢 BigQuery ${note.type} (${note.date}): `;
  const suffix = `\n\nRead more: ${cleanUrl}\n#GoogleCloud #BigQuery`;
  
  // Max characters for description based on limits
  // Total limit: 280. Suffix is roughly: 12 + 23 (for URL) + 21 = 56 characters. Prefix is roughly 35 characters.
  // So we have about 180 characters left for the snippet description.
  const maxExcerptLen = 280 - (prefix.length + 23 + 22); // URL is counted as 23 characters
  
  let excerpt = note.plain_text;
  if (excerpt.length > maxExcerptLen) {
    excerpt = excerpt.substring(0, maxExcerptLen - 3) + '...';
  }
  
  const defaultTweet = `${prefix}${excerpt}${suffix}`;
  
  tweetTextarea.value = defaultTweet;
  updateCharCount();
  
  // Open the dialog modally
  detailDrawer.showModal();
}

function closeDetailDrawer() {
  detailDrawer.close();
  selectedNote = null;
}

function updateCharCount() {
  const text = tweetTextarea.value;
  
  // Compute X character count
  // X counts all URLs as 23 characters
  const urlRegex = /https?:\/\/[^\s]+/g;
  let count = text.length;
  
  const matches = text.match(urlRegex);
  if (matches) {
    matches.forEach(url => {
      count = count - url.length + 23;
    });
  }
  
  charCounter.innerText = `${count} / 280`;
  
  // Apply styling based on limit
  charCounter.className = 'char-counter';
  charWarning.style.display = 'none';
  
  if (count > 280) {
    charCounter.classList.add('danger');
    charWarning.style.display = 'block';
    tweetBtn.disabled = true;
  } else {
    tweetBtn.disabled = false;
    if (count > 250) {
      charCounter.classList.add('warning');
    }
  }
}

// Close when clicking outside content (on dialog backdrop)
detailDrawer.addEventListener('click', (event) => {
  // If click target is the dialog wrapper element, it's the backdrop
  if (event.target === detailDrawer) {
    closeDetailDrawer();
  }
});

drawerCloseBtn.addEventListener('click', closeDetailDrawer);

tweetTextarea.addEventListener('input', updateCharCount);

copyTweetBtn.addEventListener('click', () => {
  const tweetText = tweetTextarea.value;
  navigator.clipboard.writeText(tweetText)
    .then(() => {
      showToast('Tweet copied to clipboard!', 'success');
    })
    .catch(err => {
      showToast('Failed to copy text', 'error');
      console.error(err);
    });
});

tweetBtn.addEventListener('click', () => {
  const tweetText = tweetTextarea.value;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  showToast('Twitter intent opened in a new tab!', 'info');
});

// ==========================================================================
// Setup Listeners
// ==========================================================================

// Search listeners
searchInput.addEventListener('input', (e) => {
  currentSearchQuery = e.target.value;
  clearSearchBtn.style.display = currentSearchQuery ? 'block' : 'none';
  applyFilters();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  currentSearchQuery = '';
  clearSearchBtn.style.display = 'none';
  searchInput.focus();
  applyFilters();
});

// Filter pill listeners
filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    
    currentTypeFilter = pill.getAttribute('data-type');
    applyFilters();
  });
});

// Refresh button
refreshBtn.addEventListener('click', () => {
  fetchReleaseNotes(true);
});

// Retry error button
errorRetryBtn.addEventListener('click', () => {
  fetchReleaseNotes(true);
});

// Keyboard navigation shortcut: Esc key handled natively by dialog, but resets selected state
detailDrawer.addEventListener('close', () => {
  selectedNote = null;
});

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchReleaseNotes(false);
});
