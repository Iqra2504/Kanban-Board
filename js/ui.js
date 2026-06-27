/**
 * ==========================================================================
 * Zenith Kanban - UI Controls, Modals, Tags & Drag-and-Drop
 * ==========================================================================
 */

// Global tracker for tags assigned in the current modal form
let modalTags = [];

// Track the ID of the task pending confirmation (Delete vs Archive)
let pendingActionTaskId = null;

// Track the active column tab for mobile views ('todo', 'inprogress', 'done')
let activeMobileTab = 'todo';

/* ==========================================================================
   Theme Toggle Utilities
   ========================================================================== */

/**
 * Initializes and applies the saved theme on load (no flashing).
 */
function initTheme() {
  const currentTheme = loadTheme();
  applyTheme(currentTheme);
}

/**
 * Applies the specified theme to the body and updates toggle buttons.
 * @param {string} theme - 'light' or 'dark'
 */
function applyTheme(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  
  if (theme === 'dark') {
    document.body.classList.add('dark');
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
      themeToggle.title = 'Switch to Light Mode';
    }
  } else {
    document.body.classList.remove('dark');
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
      themeToggle.title = 'Switch to Dark Mode';
    }
  }
}

/**
 * Toggles the current theme between light and dark.
 */
function toggleTheme() {
  const isDark = document.body.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);
  saveTheme(newTheme);
}

/* ==========================================================================
   Tag Builder Utilities
   ========================================================================== */

/**
 * Renders interactive tag pills inside the modal tag container.
 */
function renderModalTags() {
  const container = document.getElementById('tags-pills-list');
  if (!container) return;

  container.innerHTML = modalTags.map((tag, idx) => `
    <span class="tag-pill-interactive">
      ${tag}
      <button type="button" data-index="${idx}" aria-label="Remove tag ${tag}">&times;</button>
    </span>
  `).join('');
}

/**
 * Appends a tag to the temporary array if it's unique.
 * @param {string} value - Raw text for tag
 */
function addTagToModal(value) {
  const tag = value.replace(/,/g, '').trim(); // Remove commas and spaces
  
  if (tag && !modalTags.includes(tag)) {
    modalTags.push(tag);
    renderModalTags();
  }
}

/**
 * Removes a tag by index position.
 * @param {number} index - Index of tag to remove
 */
function removeTagFromModal(index) {
  modalTags.splice(index, 1);
  renderModalTags();
}

/* ==========================================================================
   Modal Operations
   ========================================================================== */

/**
 * Opens a modal dialog.
 * @param {string} modalId - Element ID of the modal overlay
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    
    // Accessibility focus management
    const focusable = modal.querySelectorAll('input, select, textarea, button');
    if (focusable.length > 0) {
      // Focus on the first element after modal opens, unless it's a close button
      const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 50);
      }
    }
  }
}

/**
 * Closes a modal dialog and resets validation states.
 * @param {string} modalId - Element ID of the modal overlay
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    clearValidationErrors();
  }
}

/**
 * Clears inline error styling and text labels.
 */
function clearValidationErrors() {
  const errors = document.querySelectorAll('.error-msg');
  errors.forEach(e => {
    e.textContent = '';
    e.classList.remove('visible');
  });

  const inputs = document.querySelectorAll('.input-error');
  inputs.forEach(i => i.classList.remove('input-error'));
}

/**
 * Populates and opens the Task Modal for creating a new task.
 * @param {string} defaultColumn - Column identifier to pre-select
 */
function openCreateTaskModal(defaultColumn) {
  // Clear form fields
  document.getElementById('task-id').value = '';
  document.getElementById('task-title-input').value = '';
  document.getElementById('task-desc-input').value = '';
  document.getElementById('task-priority-input').value = 'medium';
  
  // Set min date to today to prevent choosing past dates
  const dateInput = document.getElementById('task-duedate-input');
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateInput) {
    dateInput.value = '';
    dateInput.min = todayStr;
  }

  // Pre-select column dropdown
  document.getElementById('task-column-input').value = defaultColumn || 'todo';

  // Reset tags
  modalTags = [];
  renderModalTags();
  
  // Update header text
  document.getElementById('modal-title').textContent = 'Add New Task';
  document.getElementById('modal-submit-btn').textContent = 'Create Task';

  clearValidationErrors();
  openModal('task-modal');
}

/**
 * Populates and opens the Task Modal to edit an existing task.
 * @param {number} taskId - ID of the task to edit
 */
function openEditTaskModal(taskId) {
  const tasks = getTasksList();
  const task = tasks.find(t => t.id === Number(taskId));

  if (!task) return;

  // Prefill form values
  document.getElementById('task-id').value = task.id;
  document.getElementById('task-title-input').value = task.title;
  document.getElementById('task-desc-input').value = task.description;
  document.getElementById('task-priority-input').value = task.priority;
  
  // Set date field and restrict past dates
  const dateInput = document.getElementById('task-duedate-input');
  if (dateInput) {
    dateInput.value = task.dueDate;
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  document.getElementById('task-column-input').value = task.column;

  // Set tags array
  modalTags = [...task.tags];
  renderModalTags();

  // Update header text
  document.getElementById('modal-title').textContent = 'Edit Task';
  document.getElementById('modal-submit-btn').textContent = 'Save Changes';

  clearValidationErrors();
  openModal('task-modal');
}

/* ==========================================================================
   Archive Modal Renderings
   ========================================================================== */

/**
 Renders list of archived items.
 */
function renderArchiveView() {
  const archive = getArchiveList();
  const emptyState = document.getElementById('archive-empty-state');
  const listContainer = document.getElementById('archive-list-container');

  if (!listContainer) return;

  if (archive.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    listContainer.innerHTML = '';
  } else {
    if (emptyState) emptyState.classList.add('hidden');
    
    listContainer.innerHTML = archive.map(task => {
      // Map keys to human columns
      const colLabels = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
      const colText = colLabels[task.column] || 'Unknown';
      
      return `
        <div class="archive-item" data-id="${task.id}">
          <div class="archive-item-details">
            <span class="archive-item-title">${task.title}</span>
            <span class="archive-item-col-badge">Original: ${colText}</span>
          </div>
          <div class="archive-item-actions">
            <button class="btn btn-secondary btn-text restore-archive-btn" title="Restore task back to column">
              <i class="fa-solid fa-rotate-left"></i> Restore
            </button>
            <button class="btn btn-text btn-danger delete-archive-btn" title="Delete task permanently">
              <i class="fa-solid fa-trash-can"></i> Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

/* ==========================================================================
   Mobile Columns Navigation Tab Swapper
   ========================================================================== */

/**
 * Sets the active visible column layout for tablets and mobile devices.
 * @param {string} columnId - The column container ID to show (e.g. 'todo-col')
 */
function switchMobileTab(columnId) {
  // Update tabs active styles
  const tabs = document.querySelectorAll('#column-navigation-tabs .tab-link');
  tabs.forEach(tab => {
    const target = tab.getAttribute('data-target');
    if (target === columnId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Display only the active column, hiding others
  const columns = document.querySelectorAll('.board-column');
  columns.forEach(col => {
    if (col.id === columnId) {
      col.classList.add('active-tab-column');
    } else {
      col.classList.remove('active-tab-column');
    }
  });
}

/**
 * Returns the column ID based on current active tab.
 */
function initMobileTabsState() {
  const activeTabEl = document.querySelector('#column-navigation-tabs .tab-link.active');
  if (activeTabEl) {
    const target = activeTabEl.getAttribute('data-target');
    switchMobileTab(target);
  }
}

/* ==========================================================================
   HTML5 Drag and Drop Engine
   ========================================================================== */

/**
 * Calculates the card element that sits directly under the cursor Y coordinate.
 * Used for inserting cards in-between others during dragover operations.
 * @param {HTMLElement} container - Column body container
 * @param {number} y - Mouse client Y position
 * @returns {HTMLElement|null} The next sibling card element or null
 */
function getDragAfterElement(container, y) {
  const cards = [...container.querySelectorAll('.task-card:not(.dragging)')];
  
  return cards.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    // Offset measures distance from cursor Y to the middle height of the card
    const offset = y - box.top - box.height / 2;
    
    // We want the element right below the cursor (offset < 0 but closest to 0)
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Serializes the current visual DOM cards sequence across all columns 
 * back into the in-memory array tasksList to preserve sorting order and column states.
 */
function syncTaskOrderFromDOM() {
  const allTasks = getTasksList();
  const updatedOrderedTasks = [];
  const columnIds = ['todo', 'inprogress', 'done'];

  columnIds.forEach(colId => {
    const columnBody = document.querySelector(`.column-body[data-column="${colId}"]`);
    if (columnBody) {
      const cards = columnBody.querySelectorAll('.task-card');
      cards.forEach(card => {
        const cardId = Number(card.getAttribute('data-id'));
        const taskObj = allTasks.find(t => t.id === cardId);
        
        if (taskObj) {
          // Sync new column location
          taskObj.column = colId;
          updatedOrderedTasks.push(taskObj);
        }
      });
    }
  });

  // Append any tasks that might have been filtered out of the DOM visually (to prevent data loss)
  allTasks.forEach(t => {
    if (!updatedOrderedTasks.some(nt => nt.id === t.id)) {
      updatedOrderedTasks.push(t);
    }
  });

  // Re-assign memory tasksList and commit to localStorage
  saveTasks(updatedOrderedTasks);
  
  // Set the main reference array in tasks.js
  tasksList = updatedOrderedTasks;

  // Re-render columns to clean styles and calculate real-time stats
  renderBoard();
}

/**
 * Hooks event listeners for Drag and Drop across column bodies.
 */
function initDragAndDrop() {
  const columns = document.querySelectorAll('.column-body');

  columns.forEach(colBody => {
    colBody.addEventListener('dragover', (e) => {
      e.preventDefault(); // Enable drop trigger
      colBody.classList.add('drag-over');

      const draggingCard = document.querySelector('.dragging');
      if (!draggingCard) return;

      const afterElement = getDragAfterElement(colBody, e.clientY);
      if (afterElement == null) {
        colBody.appendChild(draggingCard);
      } else {
        colBody.insertBefore(draggingCard, afterElement);
      }
    });

    colBody.addEventListener('dragleave', () => {
      colBody.classList.remove('drag-over');
    });

    colBody.addEventListener('drop', (e) => {
      e.preventDefault();
      colBody.classList.remove('drag-over');
      
      // Sync DOM sequence order back to model arrays
      syncTaskOrderFromDOM();
    });
  });
}
