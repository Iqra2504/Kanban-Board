/**
 * ==========================================================================
 * Zenith Kanban - Main Application Bootstrapper & Event Handlers
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize themes and states
  initTheme();
  initializeTasks();
  renderBoard();
  initMobileTabsState();
  initDragAndDrop();

  // 2. Event Listeners: Header
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  const demoBtn = document.getElementById('demo-btn');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      forceLoadDemoTasks();
      renderBoard();
    });
  }

  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportBoardDataToJSON);
  }

  const archiveBtn = document.getElementById('archive-btn');
  if (archiveBtn) {
    archiveBtn.addEventListener('click', () => {
      renderArchiveView();
      openModal('archive-modal');
    });
  }

  // Stats Card Clicking Event Listeners for Filters
  const totalTasksCard = document.querySelector('.stats-bar .total-tasks');
  if (totalTasksCard) {
    totalTasksCard.addEventListener('click', () => {
      setColumnFilter('all');
      renderBoard();
    });
  }

  const inProgressCard = document.querySelector('.stats-bar .in-progress-tasks');
  if (inProgressCard) {
    inProgressCard.addEventListener('click', () => {
      if (getColumnFilter() === 'inprogress') {
        setColumnFilter('all');
      } else {
        setColumnFilter('inprogress');
      }
      renderBoard();
    });
  }

  const completedCard = document.querySelector('.stats-bar .completed-tasks');
  if (completedCard) {
    completedCard.addEventListener('click', () => {
      if (getColumnFilter() === 'done') {
        setColumnFilter('all');
      } else {
        setColumnFilter('done');
      }
      renderBoard();
    });
  }

  const statsOverdueCard = document.querySelector('.stats-bar .overdue-tasks');
  if (statsOverdueCard) {
    statsOverdueCard.addEventListener('click', () => {
      if (getColumnFilter() === 'overdue') {
        setColumnFilter('all');
      } else {
        setColumnFilter('overdue');
      }
      renderBoard();
    });
  }

  // 3. Event Listeners: Filters & Searching
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      setSearchQuery(e.target.value);
      renderBoard();
    });
  }

  const priorityFilter = document.getElementById('priority-filter');
  if (priorityFilter) {
    priorityFilter.addEventListener('change', (e) => {
      setPriorityFilter(e.target.value);
      renderBoard();
    });
  }

  const sortBySelect = document.getElementById('sort-by');
  if (sortBySelect) {
    sortBySelect.addEventListener('change', (e) => {
      setSortBy(e.target.value);
      renderBoard();
    });
  }

  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      resetFilters();
      
      // Reset DOM element values
      if (searchInput) searchInput.value = '';
      if (priorityFilter) priorityFilter.value = 'all';
      if (sortBySelect) sortBySelect.value = 'dateCreated';
      
      renderBoard();
    });
  }

  // 4. Event Listeners: Mobile Column Tabs
  const columnTabsContainer = document.getElementById('column-navigation-tabs');
  if (columnTabsContainer) {
    columnTabsContainer.addEventListener('click', (e) => {
      const tabButton = e.target.closest('.tab-link');
      if (tabButton) {
        const targetColumnId = tabButton.getAttribute('data-target');
        switchMobileTab(targetColumnId);
      }
    });
  }

  // 5. Event Listeners: Board Delegated Actions (Add, Edit, Move, Trash)
  const boardGrid = document.querySelector('.board-grid');
  if (boardGrid) {
    boardGrid.addEventListener('click', (e) => {
      // Inline add button inside column header
      const addBtn = e.target.closest('.add-task-inline-btn');
      if (addBtn) {
        const column = addBtn.getAttribute('data-column');
        openCreateTaskModal(column);
        return;
      }

      // Find clicked card context
      const card = e.target.closest('.task-card');
      if (!card) return;
      const taskId = Number(card.getAttribute('data-id'));

      // Move Left
      if (e.target.closest('.move-left')) {
        const currentTask = getTasksList().find(t => t.id === taskId);
        if (currentTask) {
          const prevColMap = { inprogress: 'todo', done: 'inprogress' };
          const nextCol = prevColMap[currentTask.column];
          if (nextCol) {
            updateTaskDetails(taskId, { column: nextCol });
            renderBoard();
          }
        }
        return;
      }

      // Move Right
      if (e.target.closest('.move-right')) {
        const currentTask = getTasksList().find(t => t.id === taskId);
        if (currentTask) {
          const nextColMap = { todo: 'inprogress', inprogress: 'done' };
          const nextCol = nextColMap[currentTask.column];
          if (nextCol) {
            updateTaskDetails(taskId, { column: nextCol });
            renderBoard();
          }
        }
        return;
      }

      // Edit Button
      if (e.target.closest('.edit-btn')) {
        openEditTaskModal(taskId);
        return;
      }

      // Delete Button
      if (e.target.closest('.delete-btn')) {
        const currentTask = getTasksList().find(t => t.id === taskId);
        if (currentTask) {
          pendingActionTaskId = taskId;
          const confirmTitleEl = document.getElementById('confirm-task-title');
          if (confirmTitleEl) {
            confirmTitleEl.textContent = `"${currentTask.title}"`;
          }
          openModal('confirm-modal');
        }
        return;
      }
    });

    // Drag events delegation bindings
    boardGrid.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.task-card');
      if (card) {
        card.classList.add('dragging');
      }
    });

    boardGrid.addEventListener('dragend', (e) => {
      const card = e.target.closest('.task-card');
      if (card) {
        card.classList.remove('dragging');
      }
      // Remove any leftover column body overlays
      document.querySelectorAll('.column-body').forEach(col => {
        col.classList.remove('drag-over');
      });
    });
  }

  // 6. Event Listeners: Modal Form Submission & Custom Inputs
  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', handleTaskFormSubmit);
  }

  const tagInputField = document.getElementById('tag-input-field');
  if (tagInputField) {
    tagInputField.addEventListener('keydown', handleTagInputKeydown);
  }

  const tagsPillsList = document.getElementById('tags-pills-list');
  if (tagsPillsList) {
    tagsPillsList.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('button');
      if (removeBtn) {
        const idx = Number(removeBtn.getAttribute('data-index'));
        removeTagFromModal(idx);
      }
    });
  }

  // 7. Event Listeners: Modal Control Buttons
  // Close Task Form Modal
  const modalCloseBtn = document.getElementById('modal-close-btn');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => closeModal('task-modal'));
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', () => closeModal('task-modal'));

  // Close Confirmation Modal
  const confirmCloseBtn = document.getElementById('confirm-close-btn');
  if (confirmCloseBtn) confirmCloseBtn.addEventListener('click', () => closeModal('confirm-modal'));
  const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
  if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', () => closeModal('confirm-modal'));

  // Close Archive Modal
  const archiveCloseBtn = document.getElementById('archive-close-btn');
  if (archiveCloseBtn) archiveCloseBtn.addEventListener('click', () => closeModal('archive-modal'));
  const archiveModalCloseBtn = document.getElementById('archive-modal-close-btn');
  if (archiveModalCloseBtn) archiveModalCloseBtn.addEventListener('click', () => closeModal('archive-modal'));

  // Confirmation Modal Actions
  const confirmArchiveBtn = document.getElementById('confirm-archive-btn');
  if (confirmArchiveBtn) {
    confirmArchiveBtn.addEventListener('click', () => {
      if (pendingActionTaskId !== null) {
        archiveTaskFromBoard(pendingActionTaskId);
        closeModal('confirm-modal');
        pendingActionTaskId = null;
        renderBoard();
      }
    });
  }

  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (pendingActionTaskId !== null) {
        deleteTaskFromBoard(pendingActionTaskId);
        closeModal('confirm-modal');
        pendingActionTaskId = null;
        renderBoard();
      }
    });
  }

  // Archive Item restoration & deletion delegation
  const archiveListContainer = document.getElementById('archive-list-container');
  if (archiveListContainer) {
    archiveListContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.archive-item');
      if (!item) return;
      const itemId = Number(item.getAttribute('data-id'));

      // Restore
      if (e.target.closest('.restore-archive-btn')) {
        restoreTaskFromArchive(itemId);
        renderArchiveView();
        renderBoard();
        return;
      }

      // Purge
      if (e.target.closest('.delete-archive-btn')) {
        purgeTaskFromArchive(itemId);
        renderArchiveView();
        return;
      }
    });
  }

  // 8. Event Listeners: Global Keyboard Shortcuts
  window.addEventListener('keydown', handleGlobalKeyboardShortcuts);
});

/* ==========================================================================
   Form Handling & Custom Field Operations
   ========================================================================== */

/**
 * Custom tag creation logic based on text inputs.
 * Adds tags on keying Enter or Comma.
 * @param {KeyboardEvent} e - Input keydown event
 */
function handleTagInputKeydown(e) {
  const value = e.target.value;

  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault(); // Block form submits and typing comma
    addTagToModal(value);
    e.target.value = '';
  } else if (e.key === 'Backspace' && value === '' && modalTags.length > 0) {
    // Delete the last tag on backspace
    removeTagFromModal(modalTags.length - 1);
  }
}

/**
 * Custom Validation & Task Creation/Update Submission.
 * @param {Event} e - Form submit event
 */
function handleTaskFormSubmit(e) {
  e.preventDefault();
  clearValidationErrors();

  const titleInput = document.getElementById('task-title-input');
  const dateInput = document.getElementById('task-duedate-input');
  const taskIdInput = document.getElementById('task-id');
  const descInput = document.getElementById('task-desc-input');
  const prioritySelect = document.getElementById('task-priority-input');
  const columnSelect = document.getElementById('task-column-input');

  let isValid = true;
  let firstInvalidEl = null;

  // 1. Validate Title: Required, >= 3 characters
  const titleVal = titleInput.value.trim();
  if (!titleVal) {
    isValid = false;
    showValidationError(titleInput, 'error-title', 'Task title is required.');
    firstInvalidEl = titleInput;
  } else if (titleVal.length < 3) {
    isValid = false;
    showValidationError(titleInput, 'error-title', 'Title must be at least 3 characters long.');
    if (!firstInvalidEl) firstInvalidEl = titleInput;
  }

  // 2. Validate Due Date: Required, cannot be a past date
  const dateVal = dateInput.value;
  if (!dateVal) {
    isValid = false;
    showValidationError(dateInput, 'error-duedate', 'Due date is required.');
    if (!firstInvalidEl) firstInvalidEl = dateInput;
  } else {
    // Check if the due date is in the past
    const [year, month, day] = dateVal.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() < today.getTime()) {
      isValid = false;
      showValidationError(dateInput, 'error-duedate', 'Due date cannot be in the past.');
      if (!firstInvalidEl) firstInvalidEl = dateInput;
    }
  }

  // If validation fails, shift focus to the first invalid field
  if (!isValid) {
    if (firstInvalidEl) firstInvalidEl.focus();
    return;
  }

  // Gather validated inputs
  const taskData = {
    title: titleVal,
    description: descInput.value,
    priority: prioritySelect.value,
    dueDate: dateVal,
    tags: [...modalTags],
    column: columnSelect.value
  };

  const editingId = taskIdInput.value;

  if (editingId) {
    // Edit existing task
    updateTaskDetails(editingId, taskData);
  } else {
    // Create new task
    addNewTask(taskData);
  }

  // Close and re-render
  closeModal('task-modal');
  renderBoard();
}

/**
 * Utility to display error states on inputs.
 * @param {HTMLElement} inputEl - Form element that failed
 * @param {string} errorId - ID of error label element
 * @param {string} message - Error description text
 */
function showValidationError(inputEl, errorId, message) {
  inputEl.classList.add('input-error');
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

/* ==========================================================================
   Global Keyboard Shortcuts
   ========================================================================== */

/**
 * Hooks hotkeys: N (Create Task), / (Search Focus), Escape (Close Modals).
 * @param {KeyboardEvent} e - Key down event
 */
function handleGlobalKeyboardShortcuts(e) {
  // If user is currently typing in an input, textarea, or select field, ignore shortcuts
  const activeTagName = document.activeElement.tagName;
  const isTyping = activeTagName === 'INPUT' || 
                   activeTagName === 'TEXTAREA' || 
                   activeTagName === 'SELECT' || 
                   document.activeElement.isContentEditable;

  if (isTyping) {
    // Escape should still close modals even when typing in input
    if (e.key === 'Escape') {
      closeAllActiveModals();
    }
    return;
  }

  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    openCreateTaskModal('todo');
  } else if (e.key === '/') {
    e.preventDefault();
    const searchField = document.getElementById('search-input');
    if (searchField) {
      searchField.focus();
      searchField.select();
    }
  } else if (e.key === 'Escape') {
    closeAllActiveModals();
  }
}

/**
 * Closes all modal overlays simultaneously.
 */
function closeAllActiveModals() {
  closeModal('task-modal');
  closeModal('confirm-modal');
  closeModal('archive-modal');
}

/* ==========================================================================
   Export Board Data to JSON
   ========================================================================== */

/**
 * Triggers a download of the active tasks as a JSON file.
 */
function exportBoardDataToJSON() {
  const activeTasks = getTasksList();
  
  if (activeTasks.length === 0) {
    // Custom confirmation alert since browser alert() is prohibited
    alertCustomMessage('Export Notice', 'There are no active tasks to export. Add some tasks first!');
    return;
  }

  // Create JSON file details
  const jsonString = JSON.stringify(activeTasks, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(blob);

  // Generate date stamp for file naming
  const dateStamp = new Date().toISOString().split('T')[0];
  const fileName = `zenith_kanban_export_${dateStamp}.json`;

  // Perform virtual anchor click to trigger download
  const virtualAnchor = document.createElement('a');
  virtualAnchor.href = downloadUrl;
  virtualAnchor.download = fileName;
  document.body.appendChild(virtualAnchor);
  virtualAnchor.click();

  // Clean up
  document.body.removeChild(virtualAnchor);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Custom notification builder to replace alert()
 * @param {string} title - Heading of message
 * @param {string} msg - Message body
 */
function alertCustomMessage(title, msg) {
  // Re-use confirm-modal container to alert custom message
  const confirmModal = document.getElementById('confirm-modal');
  const confirmTitle = document.getElementById('confirm-title');
  const confirmTaskTitle = document.getElementById('confirm-task-title');
  
  const archiveBtn = document.getElementById('confirm-archive-btn');
  const deleteBtn = document.getElementById('confirm-delete-btn');
  const cancelBtn = document.getElementById('confirm-cancel-btn');

  if (confirmModal) {
    confirmTitle.textContent = title;
    confirmTaskTitle.innerHTML = `<br><span style="font-weight: 500; font-size: 0.95rem;">${msg}</span>`;
    
    // Hide archive/delete options, show only a confirmation button
    if (archiveBtn) archiveBtn.classList.add('hidden');
    if (deleteBtn) deleteBtn.classList.add('hidden');
    
    // Temporary change cancel text to "Okay"
    const originalCancelText = cancelBtn.innerHTML;
    cancelBtn.innerHTML = 'Okay';
    cancelBtn.focus();

    const restoreButtonsState = () => {
      if (archiveBtn) archiveBtn.classList.remove('hidden');
      if (deleteBtn) deleteBtn.classList.remove('hidden');
      cancelBtn.innerHTML = originalCancelText;
      cancelBtn.removeEventListener('click', restoreButtonsState);
      const closeBtn = document.getElementById('confirm-close-btn');
      if (closeBtn) closeBtn.removeEventListener('click', restoreButtonsState);
    };

    cancelBtn.addEventListener('click', restoreButtonsState);
    const closeBtn = document.getElementById('confirm-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', restoreButtonsState);

    openModal('confirm-modal');
  }
}
