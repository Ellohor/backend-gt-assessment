const express = require("express");

const app = express();
app.use(express.json());

// ─── In-Memory Storage ────────────────────────────────────────────────────────

let tasks = [];
let nextId = 1;

// ─── Authentication Middleware ────────────────────────────────────────────────

/**
 * Extracts and validates the `x-user-id` header.
 * Attaches the parsed integer to `req.userId`.
 * Returns 401 if the header is missing or not a valid integer.
 */
function authenticate(req, res, next) {
  const header = req.headers["x-user-id"];

  if (!header) {
    return res.status(401).json({ error: "Missing x-user-id header" });
  }

  const userId = parseInt(header, 10);

  if (isNaN(userId)) {
    return res.status(401).json({ error: "Invalid x-user-id: must be a number" });
  }

  req.userId = userId;
  next();
}

app.use(authenticate);

// ─── Valid Statuses ───────────────────────────────────────────────────────────

const VALID_STATUSES = ["pending", "in-progress", "completed"];

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /tasks
 * Creates a new task.
 * - `assignedBy` is automatically set to the authenticated user (req.userId).
 * - `status` defaults to 'pending'.
 * - `createdAt` is set to the current ISO timestamp.
 * - `assignedTo` is optional; defaults to null if not provided.
 * Returns 201 with the created task.
 */
app.post("/tasks", (req, res) => {
  const { title, priority, assignedTo } = req.body;

  if (!title || !priority) {
    return res.status(400).json({ error: "Fields 'title' and 'priority' are required" });
  }

  const task = {
    id: nextId++,
    title,
    priority,
    status: "pending",
    assignedTo: assignedTo !== undefined ? assignedTo : null,
    assignedBy: req.userId,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  return res.status(201).json(task);
});

/**
 * GET /tasks
 * Returns all tasks.
 * Supports optional query param filtering:
 *   - `?assignedTo=<userId>` — filters tasks assigned to a specific user.
 *   - `?status=<status>`     — filters tasks by their current status.
 * Both filters can be combined.
 */
app.get("/tasks", (req, res) => {
  let result = [...tasks];

  if (req.query.assignedTo !== undefined) {
    const assignedTo = parseInt(req.query.assignedTo, 10);
    result = result.filter((t) => t.assignedTo === assignedTo);
  }

  if (req.query.status !== undefined) {
    result = result.filter((t) => t.status === req.query.status);
  }

  return res.status(200).json(result);
});

/**
 * PATCH /tasks/:id
 * Updates a task's `title` and/or `priority`.
 * Authorization: Only the Assigner (req.userId === task.assignedBy) may edit.
 * Returns 404 if task not found, 403 if unauthorized.
 */
app.patch("/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === parseInt(req.params.id, 10));

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (req.userId !== task.assignedBy) {
    return res.status(403).json({ error: "Forbidden: only the assigner can edit this task" });
  }

  const { title, priority } = req.body;

  if (title !== undefined) task.title = title;
  if (priority !== undefined) task.priority = priority;

  return res.status(200).json(task);
});

/**
 * PATCH /tasks/:id/status
 * Updates a task's `status`.
 * Authorization: Only the Assignee (req.userId === task.assignedTo) may update the status.
 * Returns 400 if the status value is invalid, 403 if unauthorized, 404 if not found.
 */
app.patch("/tasks/:id/status", (req, res) => {
  const task = tasks.find((t) => t.id === parseInt(req.params.id, 10));

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (req.userId !== task.assignedTo) {
    return res.status(403).json({ error: "Forbidden: only the assignee can update the status" });
  }

  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  task.status = status;
  return res.status(200).json(task);
});

/**
 * PATCH /tasks/:id/unassign
 * Sets a task's `assignedTo` field to null, removing the current assignee.
 * Authorization: Only the Assigner (req.userId === task.assignedBy) may unassign.
 * Returns 403 if unauthorized, 404 if not found.
 */
app.patch("/tasks/:id/unassign", (req, res) => {
  const task = tasks.find((t) => t.id === parseInt(req.params.id, 10));

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (req.userId !== task.assignedBy) {
    return res.status(403).json({ error: "Forbidden: only the assigner can unassign this task" });
  }

  task.assignedTo = null;
  return res.status(200).json(task);
});

/**
 * DELETE /tasks/:id
 * Permanently removes a task from the in-memory array.
 * Authorization: Only the Assigner (req.userId === task.assignedBy) may delete.
 * Returns 204 No Content on success, 403 if unauthorized, 404 if not found.
 */
app.delete("/tasks/:id", (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === parseInt(req.params.id, 10));

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const task = tasks[taskIndex];

  if (req.userId !== task.assignedBy) {
    return res.status(403).json({ error: "Forbidden: only the assigner can delete this task" });
  }

  tasks.splice(taskIndex, 1);
  return res.status(204).send();
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Task Management API running on port ${PORT}`);
});

module.exports = app;