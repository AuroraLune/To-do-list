// Data structure
let data = {
  categories: []
};

// DOM Elements
const categoriesContainer = document.getElementById('categoriesContainer');
const newCategoryInput = document.getElementById('newCategoryInput');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const statsDiv = document.getElementById('stats');

// Initialize app
function init() {
  loadData();
  setupEventListeners();
}

// Event listeners
function setupEventListeners() {
  addCategoryBtn.addEventListener('click', addCategory);
  newCategoryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCategory();
  });
}

// Load data from localStorage
function loadData() {
  const savedData = localStorage.getItem('todoData');
  if (savedData) {
    try {
      data = JSON.parse(savedData);
    } catch (e) {
      console.error("Error parsing saved data:", e);
      data = { categories: [] };
    }
  }
  renderApp();
}

// Save data to localStorage
function saveData() {
  localStorage.setItem('todoData', JSON.stringify(data));
  // updateStats();
}

// Render entire app
function renderApp() {
  renderCategories();
  updateStats();
}

// Add new category
function addCategory() {
  const name = newCategoryInput.value.trim();
  
  if (!name) {
    alert('Please enter a category name');
    return;
  }
  
  if (data.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
    alert('Category already exists!');
    return;
  }
  
  data.categories.push({
    name: name,
    tasks: []
  });
  
  newCategoryInput.value = '';
  saveData();
  renderApp(); 
}

// Delete category
function deleteCategory(index) {
  if (confirm('Delete this category and all its tasks?')) {
    data.categories.splice(index, 1);
    saveData();
  }
  renderApp(); 
}

// Add new task
function addTask(categoryIndex, taskInput) {
  const text = taskInput.value.trim();
  
  if (!text) {
    alert('Please enter a task');
    return;
  }
  
  data.categories[categoryIndex].tasks.push({
    id: Date.now(),
    text: text,
    completed: false
  });
  
  taskInput.value = '';
  saveData();
  renderApp(); 
}

// Delete task
function deleteTask(categoryIndex, taskId) {
  const category = data.categories[categoryIndex];
  category.tasks = category.tasks.filter(task => task.id !== taskId);
  saveData();
  renderApp(); 
}

// Toggle task completion
function toggleTask(categoryIndex, taskId) {
  const category = data.categories[categoryIndex];
  const task = category.tasks.find(t => t.id === taskId);
  task.completed = !task.completed;
  saveData();
  renderApp(); 
}

// Render all categories and tasks
function renderCategories() {
  categoriesContainer.innerHTML = '';

  if (data.categories.length === 0) {
    categoriesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No categories yet. Add one now!</p>
      </div>
    `;
    return;
  }
  
  data.categories.forEach((category, catIndex) => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    
    // Category header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'category-header';
    headerDiv.innerHTML = `
      <h3 class="category-title"><i class="fas fa-list-alt"></i> ${category.name}</h3>
      <button class="delete-btn" data-category-index="${catIndex}">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    
    // Task list
    const taskList = document.createElement('div');
    taskList.className = 'task-list';
    
    category.tasks.forEach(task => {
      const taskDiv = document.createElement('div');
      taskDiv.className = `task ${task.completed ? 'completed' : ''}`;
      taskDiv.innerHTML = `
        <label class="task-container">
          <input type="checkbox" 
                 data-category-index="${catIndex}" 
                 data-task-id="${task.id}" 
                 ${task.completed ? 'checked' : ''}>
          <span class="task-text">${task.text}</span>
        </label>
        <button class="task-delete" data-category-index="${catIndex}" data-task-id="${task.id}">
          <i class="fas fa-times"></i>
        </button>
      `;
      taskList.appendChild(taskDiv);
    });
    
    // Add task input
    const addTaskDiv = document.createElement('div');
    addTaskDiv.className = 'add-section';
    addTaskDiv.innerHTML = `
      <input type="text" 
             id="taskInput-${catIndex}" 
             placeholder="Add new task to ${category.name}...">
      <button data-category-index="${catIndex}">
        <i class="fas fa-plus"></i> Add task
      </button>
    `;

    categoryDiv.appendChild(headerDiv);
    categoryDiv.appendChild(taskList);
    categoryDiv.appendChild(addTaskDiv);
    categoriesContainer.appendChild(categoryDiv);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      deleteCategory(parseInt(e.target.dataset.categoryIndex));
    });
  });

  document.querySelectorAll('.task-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      deleteTask(
        parseInt(e.target.dataset.categoryIndex),
        parseInt(e.target.dataset.taskId)
      );
    });
  });

  document.querySelectorAll('.task input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      toggleTask(
        parseInt(e.target.dataset.categoryIndex),
        parseInt(e.target.dataset.taskId)
      );
    });
  });

  document.querySelectorAll('.add-section button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const catIndex = parseInt(e.target.dataset.categoryIndex);
      const taskInput = document.getElementById(`taskInput-${catIndex}`);
      addTask(catIndex, taskInput);
    });
  });
}

// Update statistics
function updateStats() {
  let totalTasks = 0;
  let completedTasks = 0;
  
  data.categories.forEach(category => {
    totalTasks += category.tasks.length;
    completedTasks += category.tasks.filter(task => task.completed).length;
  });
  
  statsDiv.innerHTML = `
    ${totalTasks} total tasks | 
    ${completedTasks} completed | 
    ${totalTasks - completedTasks} remaining
  `;
}

// Start the app
document.addEventListener('DOMContentLoaded', init);