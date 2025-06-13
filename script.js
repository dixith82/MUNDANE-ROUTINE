// Get the current date
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Array of month names
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Function to render the calendar
function renderCalendar(month, year) {
    let firstDay = new Date(year, month, 1).getDay();
    let daysInMonth = new Date(year, month + 1, 0).getDate();

    document.getElementById('month-year').innerHTML = `${monthNames[month]} ${year}`;
    let calendarBody = document.getElementById('calendar-body');
    calendarBody.innerHTML = '';

    let row = document.createElement('tr');

    for (let i = 0; i < firstDay; i++) {
        let cell = document.createElement('td');
        row.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        if (row.children.length === 7) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }

        let cell = document.createElement('td');
        cell.innerHTML = day;
        row.appendChild(cell);

        addTasksToCell(cell, year, month, day);
    }

    calendarBody.appendChild(row);
}

// Function to change the month
function changeMonth(direction) {
    currentMonth += direction;

    if (currentMonth === 12) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth === -1) {
        currentMonth = 11;
        currentYear--;
    }

    renderCalendar(currentMonth, currentYear);
}

// Function to load tasks from localStorage
function loadTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

// Function to add tasks to the calendar cell
function addTasksToCell(cell, year, month, day) {
    let tasks = loadTasks();

    let monthString = (month + 1).toString().padStart(2, '0');
    let dayString = day.toString().padStart(2, '0');
    let taskDateString = `${year}-${monthString}-${dayString}`;

    tasks.forEach(task => {
        if (task.date === taskDateString && !task.completed) {
            let taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                ${task.title} on ${task.date} at ${task.time}
                <button onclick="toggleCompletion('${task.title}', '${taskDateString}')">
                    Mark as Completed
                </button>
            `;
            cell.appendChild(taskElement);
        }
    });
}

// Function to add tasks and save them to localStorage
function addTask() {
    var taskTitle = document.getElementById('task-title').value;
    var taskDate = document.getElementById('task-date').value;
    var taskTime = document.getElementById('task-time').value;

    if (taskTitle === '' || taskDate === '' || taskTime === '') {
        alert('Please provide task title, date, and time.');
        return;
    }

    var tasks = loadTasks();

    let taskExists = tasks.some(task => task.title === taskTitle && task.date === taskDate && task.time === taskTime);
    if (taskExists) {
        alert('This task already exists for the selected date and time.');
        return;
    }

    tasks.push({
        title: taskTitle,
        date: taskDate,
        time: taskTime,
        completed: false // Initialize completed status as false
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));

    document.getElementById('task-title').value = '';
    document.getElementById('task-date').value = '';
    document.getElementById('task-time').value = '';

    alert('Task added successfully! You can view it in the calendar.');
    renderTaskCompletionChart(); // Render the chart after adding a task
}

// Function to toggle task completion status
function toggleCompletion(title, date) {
    let tasks = loadTasks();
    tasks.forEach(task => {
        if (task.title === title && task.date === date) {
            task.completed = true; // Mark the task as completed
        }
    });

    localStorage.setItem('tasks', JSON.stringify(tasks)); // Save updated tasks
    renderCalendar(currentMonth, currentYear); // Re-render the calendar to remove completed tasks
    renderTaskCompletionChart(); // Update the chart after toggling completion
}

// Function to render the task completion chart
function renderTaskCompletionChart() {
    const tasks = loadTasks();
    const completedTasks = tasks.filter(task => task.completed);
    const uncompletedTasks = tasks.filter(task => !task.completed);
    const completedTaskNames = completedTasks.map(task => `${task.title} on ${task.date} at ${task.time}`);
    const uncompletedTaskNames = uncompletedTasks.map(task => `${task.title} on ${task.date} at ${task.time}`);

    const ctx = document.getElementById('tasksChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Completed Tasks', 'Uncompleted Tasks'],
            datasets: [{
                label: 'Tasks',
                data: [completedTasks.length, uncompletedTasks.length],
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Add click event listener to the chart
    ctx.canvas.onclick = function(event) {
        const activePoints = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
        if (activePoints.length > 0) {
            const index = activePoints[0].index; // Get the index of the clicked bar
            let taskList = [];
            let title = index === 0 ? 'Completed Tasks' : 'Uncompleted Tasks'; // Title for the popup

            // Determine which task list to show
            if (index === 0) { // If the completed tasks bar is clicked
                taskList = completedTaskNames;
            } else if (index === 1) { // If the uncompleted tasks bar is clicked
                taskList = uncompletedTaskNames;
            }

            // Show a prompt with the tasks
            const taskWindow = document.createElement('div');
            taskWindow.className = 'task-popup';
            taskWindow.innerHTML = `
                <div class="task-content">
                    <span class="close" onclick="closeTaskPopup()">×</span>
                    <h2>${title}</h2>
                    <pre>${taskList.length > 0 ? taskList.join('\n') : 'No tasks found.'}</pre>
                    <button class="close-button" onclick="closeTaskPopup()">Close</button>
                </div>
            `;
            document.body.appendChild(taskWindow);
        }
    };
}

// Function to close the task popup
function closeTaskPopup() {
    const taskPopup = document.querySelector('.task-popup');
    if (taskPopup) {
        taskPopup.remove();
    }
}

// Function to view all task reminders
function viewAllRemainders() {
    const tasks = loadTasks();
    const remindersWindow = document.createElement('div');
    remindersWindow.className = 'reminders-popup';
    remindersWindow.innerHTML = `
        <div class="reminders-content">
            <span class="close" onclick="closeRemindersPopup()">×</span>
            <h2>All Task Reminders</h2>
            <pre>${tasks.length > 0 ? tasks.map(task => `${task.title} on ${task.date} at ${task.time}`).join('\n') : 'No reminders found.'}</pre>
            <button class="close-button" onclick="closeRemindersPopup()">Close</button>
        </div>
    `;
    document.body.appendChild(remindersWindow);
}

// Function to close the reminders popup
function closeRemindersPopup() {
    const remindersPopup = document.querySelector('.reminders-popup');
    if (remindersPopup) {
        remindersPopup.remove();
    }
}

// Initialize the calendar when the page loads
window.onload = function() {
    renderCalendar(currentMonth, currentYear);
};
