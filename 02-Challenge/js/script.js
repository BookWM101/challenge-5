// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  const card = `
    <div class="card task-card mb-3" id="task-${task.id}" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `;
  console.log("Creating task card:", card);
  return card;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  console.log("Rendering task list");
  // Clear existing task lists
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach(task => {
    console.log("Rendering task:", task);
    const taskCard = createTaskCard(task);
    if (task.status === "to-do") {
      $("#todo-cards").append(taskCard);
    } else if (task.status === "in-progress") {
      $("#in-progress-cards").append(taskCard);
    } else if (task.status === "done") {
      $("#done-cards").append(taskCard);
    } else {
      console.error("Unknown status for task:", task.status);
    }
  });

  // Make task cards draggable
  $(".task-card").draggable({
    containment: "body",
    revert: "invalid",
    helper: "clone",
    zIndex: 100,
    start: function () {
      console.log("Dragging started for:", $(this).data("id"));
      $(this).css("opacity", 0.5);
    },
    stop: function () {
      console.log("Dragging stopped for:", $(this).data("id"));
      $(this).css("opacity", 1);
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
    console.log("Added new task:", newTask);
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
  console.log("Deleting task with ID:", taskId);
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
    console.log("Updating task status:", task);
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
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop,
    hoverClass: "lane-hover"
  });

  // Make the due date field a date picker
  $("#taskDueDate").datepicker();
});




