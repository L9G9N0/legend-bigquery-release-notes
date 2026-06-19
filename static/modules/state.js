/**
 * Application State Manager
 * Handles local state, filtering criteria, search indexing, bookmarks, and history.
 */
class StateManager {
  constructor() {
    this.allNotes = [];
    this.filteredNotes = [];
    this.selectedNote = null;
    
    // Filters (Set supports multi-select out of the box)
    this.filters = {
      types: new Set(['all']),
      searchQuery: '',
      startDate: null,
      endDate: null
    };

    // Load persisted data
    this.bookmarks = new Set(JSON.parse(localStorage.getItem('bq_bookmarks') || '[]'));
    this.history = JSON.parse(localStorage.getItem('bq_history') || '[]');
  }

  setNotes(notes) {
    this.allNotes = notes;
    this.applyFilters();
  }

  setSearchQuery(query) {
    this.filters.searchQuery = query.trim().toLowerCase();
    this.applyFilters();
  }

  toggleTypeFilter(type) {
    if (type === 'all') {
      this.filters.types.clear();
      this.filters.types.add('all');
    } else {
      this.filters.types.delete('all');
      if (this.filters.types.has(type)) {
        this.filters.types.delete(type);
        if (this.filters.types.size === 0) {
          this.filters.types.add('all');
        }
      } else {
        this.filters.types.add(type);
      }
    }
    this.applyFilters();
  }

  setDateRange(startDate, endDate) {
    this.filters.startDate = startDate ? new Date(startDate) : null;
    this.filters.endDate = endDate ? new Date(endDate) : null;
    
    // Normalize times for date comparison
    if (this.filters.startDate) this.filters.startDate.setHours(0, 0, 0, 0);
    if (this.filters.endDate) this.filters.endDate.setHours(23, 59, 59, 999);
    
    this.applyFilters();
  }

  applyFilters() {
    this.filteredNotes = this.allNotes.filter(note => {
      // 1. Type Filter
      const hasTypeFilter = !this.filters.types.has('all');
      const matchesType = !hasTypeFilter || this.filters.types.has(note.type.toLowerCase());
      
      // 2. Search Query Filter
      const query = this.filters.searchQuery;
      const matchesSearch = !query || 
                            note.date.toLowerCase().includes(query) ||
                            note.type.toLowerCase().includes(query) ||
                            note.plain_text.toLowerCase().includes(query) ||
                            note.html.toLowerCase().includes(query);
                            
      // 3. Date Range Filter
      let matchesDate = true;
      if (this.filters.startDate || this.filters.endDate) {
        // Parse date. BigQuery releases have titles like "June 17, 2026"
        const noteDate = new Date(note.date);
        if (!isNaN(noteDate.getTime())) {
          if (this.filters.startDate && noteDate < this.filters.startDate) {
            matchesDate = false;
          }
          if (this.filters.endDate && noteDate > this.filters.endDate) {
            matchesDate = false;
          }
        }
      }
      
      return matchesType && matchesSearch && matchesDate;
    });
  }

  // ==========================================================================
  // Bookmarks / Favorites System
  // ==========================================================================
  toggleBookmark(noteId) {
    if (this.bookmarks.has(noteId)) {
      this.bookmarks.delete(noteId);
      logger_log('state', `Removed bookmark: ${noteId}`);
    } else {
      this.bookmarks.add(noteId);
      logger_log('state', `Added bookmark: ${noteId}`);
    }
    localStorage.setItem('bq_bookmarks', JSON.stringify([...this.bookmarks]));
    return this.bookmarks.has(noteId);
  }

  isBookmarked(noteId) {
    return this.bookmarks.has(noteId);
  }

  // ==========================================================================
  // Recently Viewed History (Queue max size: 10)
  // ==========================================================================
  addHistory(note) {
    // Prevent duplicate entries
    this.history = this.history.filter(item => item.id !== note.id);
    
    // Add to front of history
    this.history.unshift({
      id: note.id,
      title: note.type + ' - ' + note.date,
      date: note.date,
      timestamp: Date.now()
    });
    
    // Constrain size
    if (this.history.length > 10) {
      this.history.pop();
    }
    
    localStorage.setItem('bq_history', JSON.stringify(this.history));
  }
}

// Client side debug logging helper
function logger_log(module, msg) {
  console.log(`[State:${module}] ${msg}`);
}

export const state = new StateManager();
