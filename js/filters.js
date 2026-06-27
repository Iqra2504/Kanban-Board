/**
 * ==========================================================================
 * Zenith Kanban - Search, Filter, and Sort Engine
 * ==========================================================================
 */

// Active search, filter, and sort state
let searchQuery = '';
let priorityFilter = 'all';
let sortBy = 'dateCreated'; // Default: Date Created (Newest first)
let columnFilter = 'all';    // 'all' | 'todo' | 'inprogress' | 'done' | 'overdue'

// Weighting dictionary to sort priority strings
const priorityWeight = {
  high: 3,
  medium: 2,
  low: 1
};

/**
 * Updates the search query state.
 * @param {string} query - The search query input by the user
 */
function setSearchQuery(query) {
  searchQuery = (query || '').toLowerCase().trim();
}

/**
 * Updates the active priority filter state.
 * @param {string} priority - 'all' | 'high' | 'medium' | 'low'
 */
function setPriorityFilter(priority) {
  priorityFilter = priority;
}

/**
 * Updates the active sort criteria state.
 * @param {string} criteria - 'dateCreated' | 'dueDate' | 'priority'
 */
function setSortBy(criteria) {
  sortBy = criteria;
}

/**
 * Updates the active column filter state.
 * @param {string} col - 'all' | 'todo' | 'inprogress' | 'done' | 'overdue'
 */
function setColumnFilter(col) {
  columnFilter = col;
}

/**
 * Retrieves the current column filter state.
 * @returns {string} The active column filter
 */
function getColumnFilter() {
  return columnFilter;
}

/**
 * Resets all search, filter, and sort states back to their default values.
 */
function resetFilters() {
  searchQuery = '';
  priorityFilter = 'all';
  sortBy = 'dateCreated';
  columnFilter = 'all';
}

/**
 * Detects if any filter or sort state deviates from the defaults.
 * @returns {boolean} True if any filters are active
 */
function areFiltersActive() {
  return searchQuery !== '' || priorityFilter !== 'all' || sortBy !== 'dateCreated' || columnFilter !== 'all';
}

/**
 * Filters and sorts an array of task objects based on the active filter state.
 * @param {Array<Object>} tasks - The raw tasks array
 * @returns {Array<Object>} The filtered and sorted list of tasks
 */
function getFilteredTasks(tasks) {
  // 1. Filter tasks
  let filtered = tasks.filter(task => {
    // Search query matches title or description
    const matchesSearch = task.title.toLowerCase().includes(searchQuery) || 
                          task.description.toLowerCase().includes(searchQuery);
    
    // Priority filter match
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    // Column filter match
    let matchesColumn = true;
    if (columnFilter !== 'all') {
      if (columnFilter === 'overdue') {
        matchesColumn = task.column !== 'done' && isTaskOverdue(task.dueDate);
      } else {
        matchesColumn = task.column === columnFilter;
      }
    }

    return matchesSearch && matchesPriority && matchesColumn;
  });

  // 2. Sort tasks inside each column
  filtered.sort((a, b) => {
    if (sortBy === 'dueDate') {
      // Sort by Due Date: soonest first (ascending order)
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    } else if (sortBy === 'priority') {
      // Sort by Priority: High first, then Medium, then Low
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      
      if (weightB !== weightA) {
        return weightB - weightA; // Descending weight
      }
      
      // If priorities match, secondary sort by creation date (newest first)
      return b.createdAt - a.createdAt;
    } else {
      // Sort by Date Created: newest first (descending order)
      return b.createdAt - a.createdAt;
    }
  });

  return filtered;
}
