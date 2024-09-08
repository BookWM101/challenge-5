// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  return `
    <div class="card task-card mb-3" id="task-${task.id}" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  // Clear existing task lists
  $("#todo-cards, #in-progress-cards, #done-cards").empty();

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    $(`#${task.status}-cards`).append(taskCard);
  });

  // Make task cards draggable
  $(".task-card").draggable({
    containment: "body", // Prevent dragging outside the body
    revert: "invalid", // Return to original position if not dropped on a valid droppable area
    helper: "clone", // Create a clone to drag
    zIndex: 100, // Ensure the dragged item is on top
    start: function (event, ui) {
      $(this).css("opacity", 0.5); // Reduce opacity while dragging
    },
    stop: function (event, ui) {
      $(this).css("opacity", 1); // Reset opacity after dragging
    }
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $("#taskTitle").val();
  const description = $("#taskDescription").val();
  const dueDate = $("#taskDueDate").val();
  const status = $("#taskLane").val();

  if (title) {
    const newTask = {
      id: generateTaskId(),
      title,
      description,
      dueDate,
      status
    };

    taskList.push(newTask);
    renderTaskList();

    // Save to localStorage
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));

    // Reset form and close modal
    $("#taskForm")[0].reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('formModal'));
    modal.hide();
  } else {
    alert("Task title is required!");
  }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest(".card").data("id");
  taskList = taskList.filter(task => task.id !== taskId);
  renderTaskList();

  // Save updated task list to localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = $(ui.draggable).data("id");
  const newStatus = $(this).attr("id").replace("-cards", "");

  const task = taskList.find(task => task.id === taskId);
  if (task) {
    task.status = newStatus;
    renderTaskList(); // Re-render the task list to update the UI

    // Save updated task list to localStorage
    localStorage.setItem("tasks", JSON.stringify(taskList));
  }
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // Render the task list
  renderTaskList();

  // Add event listener for adding tasks
  $("#taskForm").on("submit", handleAddTask);

  // Add event listener for deleting tasks
  $(document).on("click", ".delete-task", handleDeleteTask);

  // Make lanes droppable
  $(".lane .card-body").droppable({
    accept: ".task-card", // Only accept elements with the class "task-card"
    drop: handleDrop,
    hoverClass: "lane-hover" // Add a class to the lane on hover for visual feedback
  });

  // Make the due date field a date picker
  $("#taskDueDate").datepicker();
}); 


