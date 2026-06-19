/**
 * Main Web Application Entrypoint (ES6 Module)
 * Connects State, API, UI modules and kicks off initial execution.
 */
import { state } from './modules/state.js';
import { fetchReleaseNotes } from './modules/api.js';
import { renderGrid, showToast } from './modules/ui.js';
import { initEventListeners } from './modules/events.js';

// DOM cached selectors
const cacheTimeSpan = document.getElementById('cache-time');
const refreshBtn = document.getElementById('refresh-btn');
const notesGrid = document.getElementById('notes-grid');
const errorBanner = document.getElementById('error-banner');
const noResultsDiv = document.getElementById('no-results');

async function loadData(forceRefresh = false) {
  // Toggle loading states
  toggleLoadIndicator(true);
  errorBanner.style.display = 'none';
  noResultsDiv.style.display = 'none';
  
  // Render pulse card skeleton loaders
  notesGrid.innerHTML = Array(6).fill('<div class="skeleton-card"></div>').join('');
  
  try {
    const data = await fetchReleaseNotes(forceRefresh);
    
    // Set notes in State manager
    state.setNotes(data.notes || []);
    
    // Update cache timestamp display
    if (data.cached_at) {
      const cacheDate = new Date(data.cached_at * 1000);
      cacheTimeSpan.innerText = `Updated: ${cacheDate.toLocaleTimeString()}`;
    }
    
    if (data.status === 'warning') {
      showToast(data.message, 'error', 5000);
    } else if (forceRefresh) {
      showToast('Dashboard content successfully updated!', 'success');
    }
    
    // Perform layout render
    renderGrid(true);
    
  } catch (error) {
    console.error('[AppInitError]', error);
    showToast(`Error: ${error.message}`, 'error', 5000);
    
    errorBanner.style.display = 'flex';
    notesGrid.innerHTML = '';
    document.getElementById('results-count').innerText = 'Error loading feed';
  } finally {
    toggleLoadIndicator(false);
  }
}

function toggleLoadIndicator(isLoading) {
  if (refreshBtn) {
    if (isLoading) {
      refreshBtn.classList.add('loading');
      refreshBtn.disabled = true;
    } else {
      refreshBtn.classList.remove('loading');
      refreshBtn.disabled = false;
    }
  }
}

// ==========================================================================
// Theme Management (Light / Dark)
// ==========================================================================
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;
  
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = `${savedTheme}-theme`;
  
  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    
    document.body.className = `${newTheme}-theme`;
    localStorage.setItem('theme', newTheme);
    showToast(`Switched to ${newTheme} theme`, 'info', 1500);
  });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  initEventListeners(() => loadData(true));
  loadData(false);
});
