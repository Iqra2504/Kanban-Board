/**
 * ==========================================================================
 * Zenith Kanban - Dashboard Statistics Engine
 * ==========================================================================
 */



/**
 * Recalculates and updates the stats bar numbers and progress animations.
 * @param {Array<Object>} tasks - The active task list
 */
function updateStatistics(tasks) {
  const totalTasks = tasks.length;
  
  // Count tasks in each column state
  const inProgressCount = tasks.filter(t => t.column === 'inprogress').length;
  const completedCount = tasks.filter(t => t.column === 'done').length;
  
  // Overdue count: past due date AND not in Done
  const overdueCount = tasks.filter(t => t.column !== 'done' && isTaskOverdue(t.dueDate)).length;

  // Calculate completion percentage safely
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Update numbers in DOM
  const totalEl = document.getElementById('stat-total');
  const inProgressEl = document.getElementById('stat-inprogress');
  const completedEl = document.getElementById('stat-completed');
  const overdueEl = document.getElementById('stat-overdue');
  const percentTextEl = document.getElementById('stat-percent-text');
  const progressBarFillEl = document.getElementById('stat-progress-bar');
  const overdueCardEl = document.getElementById('stat-overdue-card');

  if (totalEl) totalEl.textContent = totalTasks;
  if (inProgressEl) inProgressEl.textContent = inProgressCount;
  if (completedEl) completedEl.textContent = completedCount;
  if (overdueEl) overdueEl.textContent = overdueCount;
  
  // Apply conditional overdue alarm colors
  if (overdueCardEl) {
    if (overdueCount > 0) {
      overdueCardEl.classList.add('overdue-alert');
      overdueEl.classList.add('overdue-badge-alert');
    } else {
      overdueCardEl.classList.remove('overdue-alert');
      overdueEl.classList.remove('overdue-badge-alert');
    }
  }

  // Update progress bar
  if (percentTextEl) percentTextEl.textContent = `${completionPercentage}%`;
  if (progressBarFillEl) {
    progressBarFillEl.style.width = `${completionPercentage}%`;
    progressBarFillEl.setAttribute('aria-valuenow', completionPercentage);
  }
}
