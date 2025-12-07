// DOM Elements
const dateInput = document.getElementById('journal-date');
const dailyLog = document.getElementById('daily-log');
const sleepInput = document.getElementById('sleep');
const waterInput = document.getElementById('water');
const stepsInput = document.getElementById('steps');
const readingYes = document.getElementById('reading-yes');
const readingNo = document.getElementById('reading-no');
const exerciseYes = document.getElementById('exercise-yes');
const exerciseNo = document.getElementById('exercise-no');
const spendingYes = document.getElementById('spending-yes');
const spendingNo = document.getElementById('spending-no');
const gratitude1 = document.getElementById('gratitude1');
const gratitude2 = document.getElementById('gratitude2');
const gratitude3 = document.getElementById('gratitude3');
const professional = document.getElementById('professional');
const personal = document.getElementById('personal');
const priority1 = document.getElementById('priority1');
const priority2 = document.getElementById('priority2');
const priority3 = document.getElementById('priority3');
const expenses = document.getElementById('expenses');
const savings = document.getElementById('savings');
const entryDatesList = document.getElementById('entry-dates');

// Progress Elements
const currentStreakEl = document.getElementById('current-streak');
const daysThisMonthEl = document.getElementById('days-this-month');
const completionRateEl = document.getElementById('completion-rate');
const daysCompletedEl = document.getElementById('days-completed');
const totalDaysEl = document.getElementById('total-days');
const monthProgressBar = document.getElementById('month-progress-bar');

// Goals Elements
const weeklyGoalsList = document.getElementById('weekly-goals-list');
const monthlyGoalsList = document.getElementById('monthly-goals-list');
const addWeeklyGoalBtn = document.getElementById('add-weekly-goal');
const addMonthlyGoalBtn = document.getElementById('add-monthly-goal');
const weeklyGoalsProgress = document.getElementById('weekly-goals-progress');
const monthlyGoalsProgress = document.getElementById('monthly-goals-progress');
const weeklyGoalsCompletedEl = document.getElementById('weekly-goals-completed');
const weeklyGoalsTotalEl = document.getElementById('weekly-goals-total');
const monthlyGoalsCompletedEl = document.getElementById('monthly-goals-completed');
const monthlyGoalsTotalEl = document.getElementById('monthly-goals-total');

// Modal Elements
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <h3>Add Goal</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label for="goal-title">Goal Title</label>
                <input type="text" id="goal-title" placeholder="Enter goal title" required>
            </div>
            <div class="form-group">
                <label for="goal-description">Description (Optional)</label>
                <textarea id="goal-description" placeholder="Enter goal description"></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-goal">Cancel</button>
            <button class="btn btn-primary" id="save-goal">Save Goal</button>
        </div>
    </div>
`;
document.body.appendChild(modal);

// State
let currentGoalType = null; // 'weekly' or 'monthly'
let editingGoalId = null;
let goals = {
    weekly: [],
    monthly: []
};

// Current week and month identifiers
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // 1-12
const currentWeek = getWeekNumber(currentDate);
const currentWeekKey = `${currentYear}-W${currentWeek.toString().padStart(2, '0')}`;
const currentMonthKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

// Set default date to today
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadEntry();
    loadEntryDates().then(() => {
        updateProgressStats();
    });
    
    // Set up mutual exclusion for checkboxes
    setupCheckboxGroup(readingYes, readingNo);
    setupCheckboxGroup(exerciseYes, exerciseNo);
    setupCheckboxGroup(spendingYes, spendingNo);
    
    // Update progress when date changes
    dateInput.addEventListener('change', updateProgressStats);
    
    // Goals event listeners
    addWeeklyGoalBtn.addEventListener('click', () => openGoalModal('weekly'));
    addMonthlyGoalBtn.addEventListener('click', () => openGoalModal('monthly'));
    
    // Modal event listeners
    document.getElementById('cancel-goal').addEventListener('click', closeGoalModal);
    document.getElementById('save-goal').addEventListener('click', saveGoal);
    document.querySelector('.modal-close').addEventListener('click', closeGoalModal);
    
    // Load goals
    loadGoals();
});

// Set up checkbox groups to ensure only one is selected
function setupCheckboxGroup(yesCheckbox, noCheckbox) {
    yesCheckbox.addEventListener('change', () => {
        if (yesCheckbox.checked) {
            noCheckbox.checked = false;
        }
    });
    
    noCheckbox.addEventListener('change', () => {
        if (noCheckbox.checked) {
            yesCheckbox.checked = false;
        }
    });
}

// Load entry for the selected date
async function loadEntry() {
    const date = dateInput.value;
    try {
        const response = await fetch(`/api/entries/${date}`);
        if (response.ok) {
            const entry = await response.json();
            if (entry) {
                // Populate the form with the entry data
                dailyLog.value = entry.dailyLog || '';
                sleepInput.value = entry.habits?.sleep || '';
                waterInput.value = entry.habits?.water || '';
                stepsInput.value = entry.habits?.steps || '';
                
                // Set checkbox states
                if (entry.habits?.reading !== undefined) {
                    if (entry.habits.reading) {
                        readingYes.checked = true;
                        readingNo.checked = false;
                    } else {
                        readingYes.checked = false;
                        readingNo.checked = true;
                    }
                } else {
                    readingYes.checked = false;
                    readingNo.checked = false;
                }
                
                if (entry.habits?.exercise !== undefined) {
                    if (entry.habits.exercise) {
                        exerciseYes.checked = true;
                        exerciseNo.checked = false;
                    } else {
                        exerciseYes.checked = false;
                        exerciseNo.checked = true;
                    }
                } else {
                    exerciseYes.checked = false;
                    exerciseNo.checked = false;
                }
                
                if (entry.habits?.noSpending !== undefined) {
                    if (entry.habits.noSpending) {
                        spendingYes.checked = true;
                        spendingNo.checked = false;
                    } else {
                        spendingYes.checked = false;
                        spendingNo.checked = true;
                    }
                } else {
                    spendingYes.checked = false;
                    spendingNo.checked = false;
                }
                
                // Set gratitude items
                gratitude1.value = entry.gratitude?.[0] || '';
                gratitude2.value = entry.gratitude?.[1] || '';
                gratitude3.value = entry.gratitude?.[2] || '';
                
                // Set other fields
                professional.value = entry.professional || '';
                personal.value = entry.personal || '';
                
                // Set priorities
                priority1.value = entry.priorities?.[0] || '';
                priority2.value = entry.priorities?.[1] || '';
                priority3.value = entry.priorities?.[2] || '';
                
                // Set finance
                expenses.value = entry.finance?.expenses || '';
                savings.value = entry.finance?.savings || '';
            } else {
                // Clear the form if no entry exists for the selected date
                clearForm(false);
            }
        } else {
            console.error('Failed to load entry');
        }
    } catch (error) {
        console.error('Error loading entry:', error);
    }
}

// Save the current entry
async function saveEntry() {
    const date = dateInput.value;
    const entry = {
        dailyLog: dailyLog.value,
        habits: {
            sleep: sleepInput.value ? parseFloat(sleepInput.value) : null,
            water: waterInput.value ? parseInt(waterInput.value) : null,
            steps: stepsInput.value ? parseInt(stepsInput.value) : null,
            reading: readingYes.checked ? true : (readingNo.checked ? false : null),
            exercise: exerciseYes.checked ? true : (exerciseNo.checked ? false : null),
            noSpending: spendingYes.checked ? true : (spendingNo.checked ? false : null)
        },
        gratitude: [
            gratitude1.value.trim(),
            gratitude2.value.trim(),
            gratitude3.value.trim()
        ].filter(item => item !== ''),
        professional: professional.value,
        personal: personal.value,
        priorities: [
            priority1.value.trim(),
            priority2.value.trim(),
            priority3.value.trim()
        ].filter(item => item !== ''),
        finance: {
            expenses: expenses.value.trim(),
            savings: savings.value.trim()
        }
    };
    
    try {
        const response = await fetch('/api/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date, data: entry })
        });
        
        if (response.ok) {
            alert('Entry saved successfully!');
            loadEntryDates(); // Refresh the list of dates
        } else {
            alert('Failed to save entry');
        }
    } catch (error) {
        console.error('Error saving entry:', error);
        alert('An error occurred while saving the entry');
    }
}

// Clear the form
function clearForm(showAlert = true) {
    // Don't clear the date
    dailyLog.value = '';
    sleepInput.value = '';
    waterInput.value = '';
    stepsInput.value = '';
    readingYes.checked = false;
    readingNo.checked = false;
    exerciseYes.checked = false;
    exerciseNo.checked = false;
    spendingYes.checked = false;
    spendingNo.checked = false;
    gratitude1.value = '';
    gratitude2.value = '';
    gratitude3.value = '';
    professional.value = '';
    personal.value = '';
    priority1.value = '';
    priority2.value = '';
    priority3.value = '';
    expenses.value = '';
    savings.value = '';
    
    if (showAlert) {
        alert('Form cleared');
    }
}

// Load the list of dates with entries
async function loadEntryDates() {
    try {
        const response = await fetch('/api/dates');
        if (response.ok) {
            const dates = await response.json();
            renderEntryDates(dates);
            return dates;
        } else {
            console.error('Failed to load entry dates');
            return [];
        }
    } catch (error) {
        console.error('Error loading entry dates:', error);
        return [];
    }
}

// Render the list of dates with entries
function renderEntryDates(dates) {
    entryDatesList.innerHTML = '';
    
    if (dates.length === 0) {
        const noEntries = document.createElement('div');
        noEntries.className = 'text-center mt-3';
        noEntries.textContent = 'No entries yet';
        entryDatesList.appendChild(noEntries);
        return;
    }
    
    dates.forEach(date => {
        const dateElement = document.createElement('div');
        dateElement.className = 'entry-date';
        dateElement.textContent = formatDate(date);
        dateElement.title = 'Click to load this entry';
        
        // Highlight the current date
        if (date === dateInput.value) {
            dateElement.classList.add('active');
        }
        
        dateElement.addEventListener('click', () => {
            dateInput.value = date;
            loadEntry();
            
            // Update active state
            document.querySelectorAll('.entry-date').forEach(el => el.classList.remove('active'));
            dateElement.classList.add('active');
        });
        
        entryDatesList.appendChild(dateElement);
    });
}

// Format date for display (e.g., "2023-10-15" -> "Oct 15, 2023")
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Get ISO week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

// Open goal modal
function openGoalModal(type, goal = null) {
    currentGoalType = type;
    editingGoalId = goal ? goal.id : null;
    
    const title = document.querySelector('.modal-header h3');
    const goalTitle = document.getElementById('goal-title');
    const goalDescription = document.getElementById('goal-description');
    
    title.textContent = editingGoalId ? 'Edit Goal' : 'Add Goal';
    
    if (goal) {
        goalTitle.value = goal.title;
        goalDescription.value = goal.description || '';
    } else {
        goalTitle.value = '';
        goalDescription.value = '';
    }
    
    modal.style.display = 'flex';
    goalTitle.focus();
}

// Close goal modal
function closeGoalModal() {
    modal.style.display = 'none';
    currentGoalType = null;
    editingGoalId = null;
}

// Save goal (create or update)
async function saveGoal() {
    const title = document.getElementById('goal-title').value.trim();
    const description = document.getElementById('goal-description').value.trim();
    
    if (!title) {
        alert('Please enter a goal title');
        return;
    }
    
    const goal = {
        id: editingGoalId || Date.now().toString(),
        title,
        description: description || '',
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    try {
        if (editingGoalId) {
            // Update existing goal
            const goalType = getGoalType(editingGoalId);
            const index = goals[goalType].findIndex(g => g.id === editingGoalId);
            if (index !== -1) {
                goal.completed = goals[goalType][index].completed; // Preserve completion status
                goals[goalType][index] = goal;
            }
        } else {
            // Add new goal
            const key = currentGoalType === 'weekly' ? currentWeekKey : currentMonthKey;
            if (!goals[currentGoalType][key]) {
                goals[currentGoalType][key] = [];
            }
            goals[currentGoalType][key].push(goal);
        }
        
        await saveGoals();
        renderGoals();
        closeGoalModal();
    } catch (error) {
        console.error('Error saving goal:', error);
        alert('Failed to save goal');
    }
}

// Toggle goal completion
async function toggleGoalCompletion(goalId) {
    const goalType = getGoalType(goalId);
    const periodKey = goalType === 'weekly' ? currentWeekKey : currentMonthKey;
    
    if (goals[goalType][periodKey]) {
        const goal = goals[goalType][periodKey].find(g => g.id === goalId);
        if (goal) {
            goal.completed = !goal.completed;
            goal.completedAt = goal.completed ? new Date().toISOString() : null;
            await saveGoals();
            renderGoals();
        }
    }
}

// Delete goal
async function deleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    const goalType = getGoalType(goalId);
    const periodKey = goalType === 'weekly' ? currentWeekKey : currentMonthKey;
    
    if (goals[goalType][periodKey]) {
        goals[goalType][periodKey] = goals[goalType][periodKey].filter(g => g.id !== goalId);
        await saveGoals();
        renderGoals();
    }
}

// Get goal type by ID
function getGoalType(goalId) {
    const weeklyPeriods = Object.keys(goals.weekly);
    for (const period of weeklyPeriods) {
        if (goals.weekly[period]?.some(g => g.id === goalId)) return 'weekly';
    }
    
    const monthlyPeriods = Object.keys(goals.monthly);
    for (const period of monthlyPeriods) {
        if (goals.monthly[period]?.some(g => g.id === goalId)) return 'monthly';
    }
    
    return currentGoalType || 'weekly';
}

// Render goals
function renderGoals() {
    renderGoalList('weekly', weeklyGoalsList);
    renderGoalList('monthly', monthlyGoalsList);
    updateGoalsProgress();
}

// Render goal list
function renderGoalList(type, container) {
    const periodKey = type === 'weekly' ? currentWeekKey : currentMonthKey;
    const goalItems = goals[type][periodKey] || [];
    
    if (goalItems.length === 0) {
        container.innerHTML = `<div class="no-goals">No ${type} goals set for this ${type === 'weekly' ? 'week' : 'month'}</div>`;
        return;
    }
    
    container.innerHTML = '';
    
    goalItems.forEach(goal => {
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-item';
        goalElement.innerHTML = `
            <input type="checkbox" class="goal-checkbox" ${goal.completed ? 'checked' : ''}>
            <div class="goal-text ${goal.completed ? 'completed' : ''}" title="${goal.description || ''}">
                ${goal.title}
            </div>
            <div class="goal-actions">
                <button class="edit-goal" title="Edit">✏️</button>
                <button class="delete-goal" title="Delete">🗑️</button>
            </div>
        `;
        
        // Add event listeners
        const checkbox = goalElement.querySelector('.goal-checkbox');
        const editBtn = goalElement.querySelector('.edit-goal');
        const deleteBtn = goalElement.querySelector('.delete-goal');
        
        checkbox.addEventListener('change', () => toggleGoalCompletion(goal.id));
        editBtn.addEventListener('click', () => openGoalModal(type, goal));
        deleteBtn.addEventListener('click', () => deleteGoal(goal.id));
        
        container.appendChild(goalElement);
    });
}

// Update goals progress
function updateGoalsProgress() {
    updateGoalProgress('weekly', weeklyGoalsProgress, weeklyGoalsCompletedEl, weeklyGoalsTotalEl);
    updateGoalProgress('monthly', monthlyGoalsProgress, monthlyGoalsCompletedEl, monthlyGoalsTotalEl);
}

// Update progress for a specific goal type
function updateGoalProgress(type, progressBar, completedEl, totalEl) {
    const periodKey = type === 'weekly' ? currentWeekKey : currentMonthKey;
    const goalItems = goals[type][periodKey] || [];
    const totalGoals = goalItems.length;
    const completedGoals = goalItems.filter(g => g.completed).length;
    
    completedEl.textContent = completedGoals;
    totalEl.textContent = totalGoals;
    
    if (totalGoals > 0) {
        const progressPercent = Math.round((completedGoals / totalGoals) * 100);
        progressBar.style.width = `${progressPercent}%`;
    } else {
        progressBar.style.width = '0%';
    }
}

// Load goals from the server
async function loadGoals() {
    try {
        const response = await fetch('/api/goals');
        if (!response.ok) {
            throw new Error('Failed to load goals');
        }
        const goals = await response.json();
        return goals || {};
    } catch (error) {
        console.error('Error loading goals:', error);
        return {};
    }
}

// Save goals to the server
async function saveGoals(goals) {
    try {
        const response = await fetch('/api/goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(goals)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save goals');
        }
        return true;
    } catch (error) {
        console.error('Error saving goals:', error);
        return false;
    }
}

// Update the renderGoals function to be async
async function renderGoals() {
    const goals = await loadGoals();
    renderGoalList('weekly', weeklyGoalsList);
    renderGoalList('monthly', monthlyGoalsList);
    updateGoalsProgress();
}

// Update the saveGoal function to be async
async function saveGoal() {
    const goalTitle = document.getElementById('goal-title').value.trim();
    const goalDescription = document.getElementById('goal-description').value.trim();
    const goalType = document.getElementById('goal-type').value;
    const goalId = document.getElementById('goal-id').value || Date.now().toString();
    
    if (!goalTitle) {
        alert('Please enter a goal title');
        return;
    }

    const goals = await loadGoals();
    const currentDate = new Date();
    const weekKey = `${currentDate.getFullYear()}-W${getWeekNumber(currentDate)}`;
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const goal = {
        id: goalId,
        title: goalTitle,
        description: goalDescription,
        completed: false,
        createdAt: new Date().toISOString()
    };

    if (goalType === 'weekly') {
        if (!goals.weekly) goals.weekly = {};
        if (!goals.weekly[weekKey]) goals.weekly[weekKey] = [];
        
        const existingIndex = goals.weekly[weekKey].findIndex(g => g.id === goalId);
        if (existingIndex >= 0) {
            goals.weekly[weekKey][existingIndex] = goal;
        } else {
            goals.weekly[weekKey].push(goal);
        }
    } else {
        if (!goals.monthly) goals.monthly = {};
        if (!goals.monthly[monthKey]) goals.monthly[monthKey] = [];
        
        const existingIndex = goals.monthly[monthKey].findIndex(g => g.id === goalId);
        if (existingIndex >= 0) {
            goals.monthly[monthKey][existingIndex] = goal;
        } else {
            goals.monthly[monthKey].push(goal);
        }
    }

    const saved = await saveGoals(goals);
    if (saved) {
        closeGoalModal();
        await renderGoals();
    } else {
        alert('Failed to save goal. Please try again.');
    }
}

// Update the toggleGoalCompletion function to be async
async function toggleGoalCompletion(goalId) {
    const goals = await loadGoals();
    const currentDate = new Date();
    const weekKey = `${currentDate.getFullYear()}-W${getWeekNumber(currentDate)}`;
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    let found = false;

    // Check weekly goals
    if (goals.weekly && goals.weekly[weekKey]) {
        const goalIndex = goals.weekly[weekKey].findIndex(g => g.id === goalId);
        if (goalIndex >= 0) {
            goals.weekly[weekKey][goalIndex].completed = !goals.weekly[weekKey][goalIndex].completed;
            goals.weekly[weekKey][goalIndex].completedAt = goals.weekly[weekKey][goalIndex].completed ? 
                new Date().toISOString() : undefined;
            found = true;
        }
    }

    // Check monthly goals if not found in weekly
    if (!found && goals.monthly && goals.monthly[monthKey]) {
        const goalIndex = goals.monthly[monthKey].findIndex(g => g.id === goalId);
        if (goalIndex >= 0) {
            goals.monthly[monthKey][goalIndex].completed = !goals.monthly[monthKey][goalIndex].completed;
            goals.monthly[monthKey][goalIndex].completedAt = goals.monthly[monthKey][goalIndex].completed ? 
                new Date().toISOString() : undefined;
            found = true;
        }
    }

    if (found) {
        const saved = await saveGoals(goals);
        if (saved) {
            await renderGoals();
        } else {
            alert('Failed to update goal status. Please try again.');
        }
    }
}

// Update the deleteGoal function to be async
async function deleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
        return;
    }

    const goals = await loadGoals();
    const currentDate = new Date();
    const weekKey = `${currentDate.getFullYear()}-W${getWeekNumber(currentDate)}`;
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    let found = false;

    // Check weekly goals
    if (goals.weekly && goals.weekly[weekKey]) {
        const goalIndex = goals.weekly[weekKey].findIndex(g => g.id === goalId);
        if (goalIndex >= 0) {
            goals.weekly[weekKey].splice(goalIndex, 1);
            found = true;
        }
    }

    // Check monthly goals if not found in weekly
    if (!found && goals.monthly && goals.monthly[monthKey]) {
        const goalIndex = goals.monthly[monthKey].findIndex(g => g.id === goalId);
        if (goalIndex >= 0) {
            goals.monthly[monthKey].splice(goalIndex, 1);
            found = true;
        }
    }

    if (found) {
        const saved = await saveGoals(goals);
        if (saved) {
            await renderGoals();
        } else {
            alert('Failed to delete goal. Please try again.');
        }
    }
}

// Update the renderGoalList function to be async
async function renderGoalList(type, container) {
    const goals = await loadGoals();
    const currentDate = new Date();
    const key = type === 'weekly' 
        ? `${currentDate.getFullYear()}-W${getWeekNumber(currentDate)}`
        : `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const typeGoals = (goals[type] && goals[type][key]) || [];
    
    if (typeGoals.length === 0) {
        container.innerHTML = '<div class="no-goals">No goals set for this ' + type + '</div>';
        return;
    }

    container.innerHTML = typeGoals.map(goal => `
        <div class="goal-item ${goal.completed ? 'completed' : ''}" data-id="${goal.id}">
            <div class="goal-content">
                <input type="checkbox" ${goal.completed ? 'checked' : ''} 
                    onchange="toggleGoalCompletion('${goal.id}')">
                <span class="goal-title">${goal.title}</span>
                ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
                <div class="goal-actions">
                    <button class="btn-icon" onclick="openGoalModal('${type}', '${goal.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteGoal('${goal.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Update progress
    updateGoalProgress(type, 
        type === 'weekly' ? weeklyGoalsProgress : monthlyGoalsProgress,
        type === 'weekly' ? weeklyGoalsCompletedEl : monthlyGoalsCompletedEl,
        type === 'weekly' ? weeklyGoalsTotalEl : monthlyGoalsTotalEl
    );
}

// Update the updateGoalsProgress function to be async
async function updateGoalsProgress() {
    const goals = await loadGoals();
    const currentDate = new Date();
    const weekKey = `${currentDate.getFullYear()}-W${getWeekNumber(currentDate)}`;
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Update weekly goals progress
    const weeklyGoals = (goals.weekly && goals.weekly[weekKey]) || [];
    const weeklyCompleted = weeklyGoals.filter(g => g.completed).length;
    const weeklyTotal = weeklyGoals.length;
    const weeklyProgress = weeklyTotal > 0 ? (weeklyCompleted / weeklyTotal) * 100 : 0;
    
    weeklyGoalsProgress.style.width = `${weeklyProgress}%`;
    weeklyGoalsCompletedEl.textContent = weeklyCompleted;
    weeklyGoalsTotalEl.textContent = weeklyTotal;
    
    // Update monthly goals progress
    const monthlyGoals = (goals.monthly && goals.monthly[monthKey]) || [];
    const monthlyCompleted = monthlyGoals.filter(g => g.completed).length;
    const monthlyTotal = monthlyGoals.length;
    const monthlyProgress = monthlyTotal > 0 ? (monthlyCompleted / monthlyTotal) * 100 : 0;
    
    monthlyGoalsProgress.style.width = `${monthlyProgress}%`;
    monthlyGoalsCompletedEl.textContent = monthlyCompleted;
    monthlyGoalsTotalEl.textContent = monthlyTotal;
}

// Update the openGoalModal function to be async
async function openGoalModal(type, goalId = null) {
    const modalTitle = document.querySelector('.modal-header h3');
    const titleInput = document.getElementById('goal-title');
    const descriptionInput = document.getElementById('goal-description');
    const typeInput = document.getElementById('goal-type');
    const goalIdInput = document.getElementById('goal-id');
    
    // Set modal title and type
    modalTitle.textContent = goalId ? 'Edit Goal' : 'Add Goal';
    typeInput.value = type;
    goalIdInput.value = goalId || '';
    
    // If editing, load the goal details
    if (goalId) {
        const goals = await loadGoals();
        const currentDate = new Date();
        const key = type === 'weekly' 
            ? `${currentDate.getFullYear()}-W${getWeekNumber(currentDate)}`
            : `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        const goalList = (goals[type] && goals[type][key]) || [];
        const goal = goalList.find(g => g.id === goalId);
        
        if (goal) {
            titleInput.value = goal.title;
            descriptionInput.value = goal.description || '';
        }
    } else {
        titleInput.value = '';
        descriptionInput.value = '';
    }
    
    // Show the modal
    modal.style.display = 'block';
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async () => {
    // Existing code...
    await renderGoals();
    // Rest of the code...
});

// Calculate and update progress statistics
async function updateProgressStats() {
    try {
        const response = await fetch('/api/entries');
        if (!response.ok) throw new Error('Failed to load entries');
        
        const entries = await response.json();
        const entryDates = Object.keys(entries).sort();
        
        if (entryDates.length === 0) {
            // No entries yet
            currentStreakEl.textContent = '0';
            daysThisMonthEl.textContent = '0';
            completionRateEl.textContent = '0%';
            daysCompletedEl.textContent = '0';
            monthProgressBar.style.width = '0%';
            return;
        }
        
        // Calculate current streak
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let currentStreak = 0;
        let checkDate = new Date(today);
        
        // Check if today has an entry
        const todayStr = today.toISOString().split('T')[0];
        const hasEntryToday = entryDates.includes(todayStr);
        
        // If today has an entry, start counting from today, otherwise from yesterday
        let currentDate = hasEntryToday ? new Date(today) : new Date(yesterday);
        
        // Check consecutive days with entries
        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (entryDates.includes(dateStr)) {
                currentStreak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        // Calculate monthly stats
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Count entries in current month
        const currentMonthEntries = entryDates.filter(date => {
            const [year, month] = date.split('-').map(Number);
            return year === currentYear && month === currentMonth + 1; // Months are 0-indexed in JS
        });
        
        const daysCompleted = currentMonthEntries.length;
        const completionRate = Math.round((daysCompleted / today.getDate()) * 100);
        
        // Update UI
        currentStreakEl.textContent = currentStreak;
        daysThisMonthEl.textContent = daysCompleted;
        completionRateEl.textContent = `${completionRate}%`;
        daysCompletedEl.textContent = daysCompleted;
        totalDaysEl.textContent = daysInMonth;
        
        // Update progress bar
        const progressPercent = Math.min(100, Math.round((daysCompleted / daysInMonth) * 100));
        monthProgressBar.style.width = `${progressPercent}%`;
        
    } catch (error) {
        console.error('Error updating progress stats:', error);
    }
}

// Update progress stats after saving an entry
async function saveEntry() {
    const date = dateInput.value;
    const entry = {
        dailyLog: dailyLog.value,
        habits: {
            sleep: sleepInput.value ? parseFloat(sleepInput.value) : null,
            water: waterInput.value ? parseInt(waterInput.value) : null,
            steps: stepsInput.value ? parseInt(stepsInput.value) : null,
            reading: readingYes.checked ? true : (readingNo.checked ? false : null),
            exercise: exerciseYes.checked ? true : (exerciseNo.checked ? false : null),
            noSpending: spendingYes.checked ? true : (spendingNo.checked ? false : null)
        },
        gratitude: [
            gratitude1.value.trim(),
            gratitude2.value.trim(),
            gratitude3.value.trim()
        ].filter(item => item !== ''),
        professional: professional.value,
        personal: personal.value,
        priorities: [
            priority1.value.trim(),
            priority2.value.trim(),
            priority3.value.trim()
        ].filter(item => item !== ''),
        finance: {
            expenses: expenses.value.trim(),
            savings: savings.value.trim()
        }
    };
    
    try {
        const response = await fetch('/api/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date, data: entry })
        });
        
        if (response.ok) {
            alert('Entry saved successfully!');
            await loadEntryDates(); // Refresh the list of dates
            await updateProgressStats(); // Update progress after saving
        } else {
            alert('Failed to save entry');
        }
    } catch (error) {
        console.error('Error saving entry:', error);
        alert('An error occurred while saving the entry');
    }
}
