# Zenith Kanban - Task Manager

Zenith Kanban is a high-performance, responsive task management board built entirely using vanilla HTML5, CSS3, and JavaScript (ES6+). The board streamlines project workflows with real-time dashboard statistics, complex search/filter combinations, custom modal dialogs, tag builders, light/dark themes, and drag-and-drop card reordering, persisting its full state locally for seamless page reloads.

## Live Demo
> **Live Link**: [Insert Your Deployed Live URL Here] (e.g. GitHub Pages, Netlify, or Vercel)
> *Note: Submitting this assignment without a live link loses 5 marks. To deploy for free, drag this project folder into [Netlify Drop](https://app.netlify.com/drop) or connect your repository to Vercel/GitHub Pages.*

---

## Features

### Core Features
- **Three Fixed Columns Layout**: Organizes tasks in clean, color-coded columns: **To Do** (Blue), **In Progress** (Amber), and **Done** (Emerald).
- **Responsive Adaptive Interface**: 
  - **Desktop (1024px+)**: Traditional multi-column view showing all states side-by-side.
  - **Tablets & Mobile (below 1024px)**: Single active column viewport with smooth, count-badge tabs at the top for switching views.
- **Form Fields & Custom Validation**:
  - Modal panel for task creation and editing.
  - Required fields (**Title** min 3 chars, **Due Date** prevents selecting past dates).
  - Validation errors displayed inline in red below each field (no raw browser alerts).
  - Interactive **Tags pill input** allowing commas or Enter keys to create tags, with backspace/delete removal actions.
- **Urgent & Overdue Controls**:
  - Displays due dates as human-readable dates (e.g. "Dec 25, 2025").
  - Identifies overdue items in real-time, displaying a red **Overdue** indicator badge and applying red left border treatments to non-Done cards.
  - Renders a relative countdown label on upcoming tasks (e.g., "Due in 3 days", "Due tomorrow").
- **Dashboard Statistics Bar**: 
  - Displays **Total Tasks**, **In Progress**, **Completed**, and **Overdue** metrics in real-time.
  - Renders an animated progress completion bar with percentage indicators.
- **Combined Search, Filters & Sorting**:
  - Full-text search matching titles and descriptions.
  - Priority filter dropdown (All, High, Medium, Low).
  - Multi-criteria sorting (Soonest Due Date, High-to-Low Priority, Newest Creation Date).
  - Clear filters action to reset all criteria.
- **Custom Alert & Confirm Dialogs**: Completely custom UI popups replacing `alert()` and `confirm()` blocks to keep design styling unified.
- **LocalStorage Persistence**: Commits and loads the active tasks list, archive lists, and light/dark theme preference automatically.

### Premium Bonus Features (Implemented)
- **HTML5 Drag-and-Drop API**: Cards can be dragged between columns to change states, and reordered directly within columns by dragging.
- **Task Archive Drawer**: Instead of permanent deletion, tasks are moved to a secure **Archive** view where they can be restored or purged.
- **Keyboard Shortcuts**:
  - Press `N` to open the New Task form.
  - Press `/` to focus the search box.
  - Press `Escape` to close any active modal overlay.
- **JSON State Exporter**: Downloads active tasks list as a `.json` file instantly using Blob URL download links.

---

## Required Task Data Structure
Each task is stored as a JavaScript object in a flat array following the exact schema required:

```javascript
// Array of task objects stored in localStorage under 'tasks'
const tasks = [
  {
    id: 1703001234567,       // Date.now() at creation time
    title: 'Build the login page',
    description: 'Create a responsive login form with validation',
    priority: 'high',        // 'high' | 'medium' | 'low'
    column: 'inprogress',    // 'todo' | 'inprogress' | 'done'
    dueDate: '2025-12-25',   // ISO date string YYYY-MM-DD
    tags: ['HTML', 'CSS', 'JS'],
    createdAt: 1703001234567 // Date.now() at creation time
  }
];
```

---

## Technologies Used
- **Structure**: HTML5 Semantic Markup
- **Styling**: Vanilla CSS3 Custom Variables, Flexbox, Grid, CSS Transitions/Animations
- **Logic**: Vanilla JavaScript (ES6+), LocalStorage API, HTML5 Drag & Drop API, Blob URLs
- **Icons**: Font Awesome (6.4.0 CDN)
- **Typography**: Google Fonts (Inter)

---

## How to Run Locally

### Prerequisites
You only need a modern web browser (Google Chrome, Firefox, Microsoft Edge, Safari). No Node.js packages or build servers are required.

### Step-by-Step Launch
1. Clone or download this project folder to your local machine.
2. Locate the `index.html` file in the root directory.
3. **Double-click** `index.html` to open the application directly in your default browser.
4. *Alternative*: Run a local server for testing using VS Code's "Live Server" extension, or run standard commands from the terminal inside the folder:
   - Python: `python -m http.server 8000` (then open `http://localhost:8000`)
   - Node: `npx serve` or `npx http-server`

---

## What I Learned (Reflection)
Building this project using pure vanilla CSS and JavaScript highlighted the power and flexibility of modern web APIs when used without abstraction layers. The most challenging aspect was synchronizing state in a model-view architecture without frameworks like React. Managing card positions during drag-and-drop operations required implementing a custom distance-calculation algorithm in `js/ui.js` that translates visual DOM node shifts directly back into the flat index positions of the core tasks array, guaranteeing that card orders are saved properly across page reloads.

Additionally, handling dates in plain JavaScript without libraries like Day.js or Moment.js required custom parsing functions to prevent timezone offsets when converting date string values (e.g. YYYY-MM-DD) into local midnight timestamps. Finally, preventing theme-toggling screen flashing on initial load was solved by loading styles synchronously, showcasing the value of writing clean, blocking stylesheet links and prioritizing initial execution scripts.

---

## Walkthrough Video Link
> **Walkthrough URL**: [Insert your unlisted YouTube or Google Drive walkthrough link here]  
> *Note: Video length must be between 3 to 5 minutes. Submissions without a video lose 10 marks.*

---

## Required Screenshots
To fulfill assignment requirements, capture and replace these placeholder screenshots after adding some sample tasks:
1. **Desktop view**: Capture the main 3-column layout containing a few tasks. Save as `screenshots/desktop_view.png` or reference here.
2. **Mobile view**: Capture the active tab column layout (e.g. Chrome DevTools set to Mobile view). Save as `screenshots/mobile_view.png`.
3. **Modal Form view**: Capture the Create Task modal open with validation errors or tags visible. Save as `screenshots/modal_view.png`.
