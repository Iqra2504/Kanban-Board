/**
 * ==========================================================================
 * Zenith Kanban - LocalStorage Manager
 * ==========================================================================
 */

/**
 * Loads tasks from localStorage. Returns empty array if not present.
 * @returns {Array<Object>} List of task objects
 */
function loadTasks() {
  try {
    const tasksData = localStorage.getItem('tasks');
    return tasksData ? JSON.parse(tasksData) : [];
  } catch (error) {
    console.error('Error reading tasks from localStorage:', error);
    return [];
  }
}

/**
 * Saves tasks list to localStorage.
 * @param {Array<Object>} tasks - List of task objects
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Error writing tasks to localStorage:', error);
  }
}

/**
 * Loads archived tasks from localStorage. Returns empty array if not present.
 * @returns {Array<Object>} List of archived task objects
 */
function loadArchive() {
  try {
    const archiveData = localStorage.getItem('archive_tasks');
    return archiveData ? JSON.parse(archiveData) : [];
  } catch (error) {
    console.error('Error reading archived tasks from localStorage:', error);
    return [];
  }
}

/**
 * Saves archived tasks list to localStorage.
 * @param {Array<Object>} archiveTasks - List of archived task objects
 */
function saveArchive(archiveTasks) {
  try {
    localStorage.setItem('archive_tasks', JSON.stringify(archiveTasks));
  } catch (error) {
    console.error('Error writing archived tasks to localStorage:', error);
  }
}

/**
 * Loads the user preferred theme (light/dark).
 * @returns {string} 'light' or 'dark'
 */
function loadTheme() {
  return localStorage.getItem('theme') || 'light';
}

/**
 * Saves the user preferred theme to localStorage.
 * @param {string} theme - 'light' or 'dark'
 */
function saveTheme(theme) {
  localStorage.setItem('theme', theme);
}
