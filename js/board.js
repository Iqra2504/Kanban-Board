/**
 * ==========================================================================
 * Zenith Kanban - Board Rendering Engine
 * ==========================================================================
 */

/**
 * Formats YYYY-MM-DD string into a readable format (e.g. Dec 25, 2025).
 * Does not use any external date libraries.
 * @param {string} dateString - YYYY-MM-DD format
 * @returns {string} Human-friendly formatted date
 */
function formatReadableDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}, ${year}`;
}

/**
 * Computes a human-friendly countdown message relative to today.
 * @param {string} dateString - YYYY-MM-DD format
 * @returns {string} Countdown message (e.g. 'Due in 3 days', 'Due today')
 */
function calculateCountdown(dateString) {
  if (!dateString) return '';
  
  const [year, month, day] = dateString.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return ''; // Overdue
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else {
    return `Due in ${diffDays} days`;
  }
}

/**
 * Generates the preview string of the description text up to 60 characters.
 * @param {string} text - Description content
 * @returns {string} Truncated preview text
 */
function truncateDescription(text) {
  if (!text) return '';
  if (text.length <= 60) return text;
  return text.substring(0, 60) + '...';
}

/**
 * Renders a single task card HTML.
 * @param {Object} task - Task data object
 * @returns {string} HTML string representing the task card
 */
function createTaskCardHTML(task) {
  const isDone = task.column === 'done';
  const isOverdue = !isDone && isTaskOverdue(task.dueDate);
  const dateFormatted = formatReadableDate(task.dueDate);
  const countdown = !isDone && !isOverdue ? calculateCountdown(task.dueDate) : '';
  const descPreview = truncateDescription(task.description);

  // Compile tags pills HTML
  const tagsHTML = task.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('');

  // Determine button displays based on column location
  const moveLeftHidden = task.column === 'todo' ? 'hidden' : '';
  const moveRightHidden = task.column === 'done' ? 'hidden' : '';

  // Apply conditional css classes
  const overdueClass = isOverdue ? 'overdue-card' : '';
  const doneClass = isDone ? 'done-card-treatment' : '';

  // Render the card wrapper
  return `
    <div class="task-card ${overdueClass} ${doneClass}" 
         draggable="true" 
         data-id="${task.id}" 
         data-priority="${task.priority}">
         
      <div class="card-header-block">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <h3 class="task-card-title">${task.title}</h3>
          ${isDone ? '<span class="done-checkmark-badge" title="Completed"><i class="fa-solid fa-circle-check"></i></span>' : ''}
        </div>
        ${tagsHTML ? `<div class="task-tags-container">${tagsHTML}</div>` : ''}
      </div>

      ${descPreview ? `<p class="task-card-desc">${descPreview}</p>` : ''}

      <div class="card-details">
        <div class="card-metadata-row">
          <span class="badge-item badge-priority-${task.priority}">
            ${task.priority.toUpperCase()}
          </span>

          <div class="card-date-info">
            <span class="date-text">
              <i class="fa-regular fa-calendar"></i> ${dateFormatted}
            </span>
            ${isOverdue ? '<span class="overdue-badge"><i class="fa-solid fa-clock-warn"></i> Overdue</span>' : ''}
            ${countdown ? `<span class="countdown-text">${countdown}</span>` : ''}
          </div>
        </div>

        <div class="card-actions-panel">
          <div class="card-nav-arrows">
            <button class="card-btn move-btn move-left ${moveLeftHidden}" title="Move to previous column" aria-label="Move left">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <button class="card-btn move-btn move-right ${moveRightHidden}" title="Move to next column" aria-label="Move right">
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
          
          <div class="card-crud-ops">
            <button class="card-btn edit-btn" title="Edit task" aria-label="Edit task">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="card-btn delete-btn" title="Delete/Archive task" aria-label="Delete or Archive task">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Re-renders all columns on the Kanban board based on active tasks and filters.
 */
function renderBoard() {
  const allTasks = getTasksList();
  
  // Filter and sort the tasks list
  const filteredTasks = getFilteredTasks(allTasks);

  // References to the column DOM nodes
  const todoListEl = document.getElementById('todo-list');
  const inprogressListEl = document.getElementById('inprogress-list');
  const doneListEl = document.getElementById('done-list');

  // Segregate filtered items by their current columns
  const todoTasks = filteredTasks.filter(t => t.column === 'todo');
  const inprogressTasks = filteredTasks.filter(t => t.column === 'inprogress');
  const doneTasks = filteredTasks.filter(t => t.column === 'done');

  // Compile cards HTML
  const todoCardsHTML = todoTasks.map(t => createTaskCardHTML(t)).join('');
  const inprogressCardsHTML = inprogressTasks.map(t => createTaskCardHTML(t)).join('');
  const doneCardsHTML = doneTasks.map(t => createTaskCardHTML(t)).join('');

  // Handle empty column placeholders
  const emptyPlaceholder = (colName) => `
    <div class="column-empty-placeholder">
      <i class="fa-solid fa-clipboard-question"></i>
      <p>No tasks in ${colName}</p>
    </div>
  `;

  if (todoListEl) {
    todoListEl.innerHTML = todoTasks.length > 0 ? todoCardsHTML : emptyPlaceholder('To Do');
  }
  if (inprogressListEl) {
    inprogressListEl.innerHTML = inprogressTasks.length > 0 ? inprogressCardsHTML : emptyPlaceholder('In Progress');
  }
  if (doneListEl) {
    doneListEl.innerHTML = doneTasks.length > 0 ? doneCardsHTML : emptyPlaceholder('Done');
  }

  // Update count badges on the board column headers
  const badgeTodo = document.getElementById('badge-todo');
  const badgeInprogress = document.getElementById('badge-inprogress');
  const badgeDone = document.getElementById('badge-done');

  if (badgeTodo) badgeTodo.textContent = todoTasks.length;
  if (badgeInprogress) badgeInprogress.textContent = inprogressTasks.length;
  if (badgeDone) badgeDone.textContent = doneTasks.length;

  // Update mobile tab badges (matching active filtered count)
  const tabTodoCount = document.getElementById('tab-todo-count');
  const tabInprogressCount = document.getElementById('tab-inprogress-count');
  const tabDoneCount = document.getElementById('tab-done-count');

  if (tabTodoCount) tabTodoCount.textContent = todoTasks.length;
  if (tabInprogressCount) tabInprogressCount.textContent = inprogressTasks.length;
  if (tabDoneCount) tabDoneCount.textContent = doneTasks.length;

  // Update global statistics (using the unfiltered list for global rates as specified)
  updateStatistics(allTasks);

  // Toggle filter clear button visibility
  const clearBtn = document.getElementById('clear-filters-btn');
  if (clearBtn) {
    if (areFiltersActive()) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }

  // Highlight the active statistics card
  highlightActiveStatsCard();
}

/**
 * Highlights the stats card corresponding to the active column filter.
 */
function highlightActiveStatsCard() {
  const activeCol = getColumnFilter();
  
  // Select all stats cards
  const cards = document.querySelectorAll('.stats-bar .stats-card');
  cards.forEach(card => card.classList.remove('active-filter-card'));

  // Highlight matching card
  if (activeCol === 'all') {
    const el = document.querySelector('.stats-bar .total-tasks');
    if (el) el.classList.add('active-filter-card');
  } else if (activeCol === 'inprogress') {
    const el = document.querySelector('.stats-bar .in-progress-tasks');
    if (el) el.classList.add('active-filter-card');
  } else if (activeCol === 'done') {
    const el = document.querySelector('.stats-bar .completed-tasks');
    if (el) el.classList.add('active-filter-card');
  } else if (activeCol === 'overdue') {
    const el = document.querySelector('.stats-bar .overdue-tasks');
    if (el) el.classList.add('active-filter-card');
  }
}
