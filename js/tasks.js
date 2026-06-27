/**
 * ==========================================================================
 * Zenith Kanban - Tasks CRUD & Memory State Manager
 * ==========================================================================
 */

// In-memory states for active and archived tasks
let tasksList = [];
let archiveList = [];

/**
 * Generates sample demo tasks list relative to the current date.
 * @returns {Array<Object>} List of default sample tasks
 */
function generateSampleTasks() {
  const today = new Date();
  
  // Utility helper to offset dates relative to today
  const getOffsetDate = (offsetDays) => {
    const d = new Date();
    d.setDate(today.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
      title: 'Fix mobile tab overflow issues',
      description: 'Adjust stylesheet properties to prevent text clipping and scrollbar issues on screens under 600px.',
      priority: 'high',
      column: 'todo',
      dueDate: getOffsetDate(-2), // Overdue task to showcase overdue styling
      tags: ['CSS', 'Bug', 'Mobile'],
      createdAt: Date.now() - 1000 * 60 * 60 * 48
    },
    {
      id: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
      title: 'Implement client routing logic',
      description: 'Set up routes and route guards. Handle auth tokens storage and session expiration checks.',
      priority: 'high',
      column: 'inprogress',
      dueDate: getOffsetDate(2), // Due in 2 days
      tags: ['JS', 'Routing', 'Security'],
      createdAt: Date.now() - 1000 * 60 * 60 * 4
    },
    {
      id: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
      title: 'Design Zenith Kanban assets',
      description: 'Create vector-based logos and custom SVG icons representing flow and work states. Ensure light and dark mode versions look excellent.',
      priority: 'low',
      column: 'todo',
      dueDate: getOffsetDate(5), // Due in 5 days
      tags: ['Design', 'Assets'],
      createdAt: Date.now() - 1000 * 60 * 60 * 12
    },
    {
      id: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      title: 'Build stylesheet variables & animations',
      description: 'Draft the CSS design system, color palette for light/dark mode, and micro-animations for card transitions.',
      priority: 'medium',
      column: 'done',
      dueDate: getOffsetDate(-1), // Past due, but completed (no overdue styling)
      tags: ['CSS', 'Animations'],
      createdAt: Date.now() - 1000 * 60 * 60 * 24
    }
  ];
}

/**
 * Initializes tasks and archive lists from localStorage.
 */
function initializeTasks() {
  tasksList = loadTasks();
  archiveList = loadArchive();

  // Populate sample demo tasks if the board is empty on first load
  if (tasksList.length === 0 && !localStorage.getItem('zenith_kanban_initialized')) {
    tasksList = generateSampleTasks();
    saveTasks(tasksList);
    localStorage.setItem('zenith_kanban_initialized', 'true');
  }
}

/**
 * Forces the injection of the sample tasks, overwriting current active tasks.
 */
function forceLoadDemoTasks() {
  const samples = generateSampleTasks();
  tasksList = samples;
  saveTasks(tasksList);
  localStorage.setItem('zenith_kanban_initialized', 'true');
}

/**
 * Retrieves the current in-memory active tasks array.
 * @returns {Array<Object>} List of active tasks
 */
function getTasksList() {
  return tasksList;
}

/**
 * Retrieves the current in-memory archived tasks array.
 * @returns {Array<Object>} List of archived tasks
 */
function getArchiveList() {
  return archiveList;
}

/**
 * Adds a new task object to the active list.
 * @param {Object} taskData - Fields for the new task
 * @param {string} taskData.title - Title of task
 * @param {string} taskData.description - Description (optional)
 * @param {string} taskData.priority - 'low' | 'medium' | 'high'
 * @param {string} taskData.dueDate - ISO date string YYYY-MM-DD
 * @param {Array<string>} taskData.tags - List of tags
 * @param {string} taskData.column - 'todo' | 'inprogress' | 'done'
 * @returns {Object} The created task object
 */
function addNewTask(taskData) {
  const timestamp = Date.now();
  
  const newTaskObj = {
    id: timestamp,
    title: taskData.title.trim(),
    description: (taskData.description || '').trim(),
    priority: taskData.priority,
    column: taskData.column,
    dueDate: taskData.dueDate,
    tags: taskData.tags || [],
    createdAt: timestamp
  };

  tasksList.push(newTaskObj);
  saveTasks(tasksList);
  return newTaskObj;
}

/**
 * Updates properties of an existing active task.
 * @param {number} id - Unique timestamp ID of the task
 * @param {Object} updatedFields - Key-values to update
 * @returns {Object|null} The updated task object or null if not found
 */
function updateTaskDetails(id, updatedFields) {
  const numericId = Number(id);
  const taskIndex = tasksList.findIndex(task => task.id === numericId);

  if (taskIndex !== -1) {
    // Keep structure pristine while copying new inputs
    tasksList[taskIndex] = {
      ...tasksList[taskIndex],
      ...updatedFields,
      // Prevent overwriting the unique ID and creation timestamp
      id: numericId,
      createdAt: tasksList[taskIndex].createdAt
    };
    saveTasks(tasksList);
    return tasksList[taskIndex];
  }
  return null;
}

/**
 * Deletes a task permanently from the active list.
 * @param {number} id - Unique ID of task
 * @returns {boolean} True if successfully deleted
 */
function deleteTaskFromBoard(id) {
  const numericId = Number(id);
  const originalLength = tasksList.length;
  
  // Keep all tasks that do NOT match the given ID
  tasksList = tasksList.filter(task => task.id !== numericId);
  
  if (tasksList.length < originalLength) {
    saveTasks(tasksList);
    return true;
  }
  return false;
}

/**
 * Transfers a task from active list to the archive list.
 * @param {number} id - Unique ID of task
 * @returns {boolean} True if successfully archived
 */
function archiveTaskFromBoard(id) {
  const numericId = Number(id);
  const taskIndex = tasksList.findIndex(task => task.id === numericId);

  if (taskIndex !== -1) {
    const taskToArchive = tasksList[taskIndex];
    
    // Add to archive collection
    archiveList.push(taskToArchive);
    saveArchive(archiveList);
    
    // Remove from active list
    tasksList.splice(taskIndex, 1);
    saveTasks(tasksList);
    
    return true;
  }
  return false;
}

/**
 * Restores a task from the archive back to active columns.
 * @param {number} id - Unique ID of task
 * @returns {boolean} True if successfully restored
 */
function restoreTaskFromArchive(id) {
  const numericId = Number(id);
  const archiveIndex = archiveList.findIndex(task => task.id === numericId);

  if (archiveIndex !== -1) {
    const restoredTask = archiveList[archiveIndex];
    
    // Safety check: if column was somehow modified or is Done, we keep it, 
    // but if it is invalid, default to 'todo'
    if (!['todo', 'inprogress', 'done'].includes(restoredTask.column)) {
      restoredTask.column = 'todo';
    }
    
    // Push back to active array
    tasksList.push(restoredTask);
    saveTasks(tasksList);
    
    // Remove from archive list
    archiveList.splice(archiveIndex, 1);
    saveArchive(archiveList);
    
    return true;
  }
  return false;
}

/**
 * Deletes a task permanently from the archive list.
 * @param {number} id - Unique ID of task
 * @returns {boolean} True if successfully purged
 */
function purgeTaskFromArchive(id) {
  const numericId = Number(id);
  const originalLength = archiveList.length;
  
  archiveList = archiveList.filter(task => task.id !== numericId);
  
  if (archiveList.length < originalLength) {
    saveArchive(archiveList);
    return true;
  }
  return false;
}

/**
 * Checks if a task's due date has passed relative to today.
 * @param {string} dateString - YYYY-MM-DD
 * @returns {boolean} True if the date is in the past
 */
function isTaskOverdue(dateString) {
  if (!dateString) return false;

  const [year, month, day] = dateString.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate.getTime() < today.getTime();
}
