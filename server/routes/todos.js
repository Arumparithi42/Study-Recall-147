import { Router } from "express";
import Todo from "../models/Todo.js";

const router = Router();

// List all todos, newest first.
router.get("/", async (req, res) => {
  const todos = await Todo.find().sort({ addedDate: -1 });
  res.json(todos);
});

// Create a new study entry. addedDate is always "now" - never client-supplied,
// so the 4/7 day math can't be gamed or mistyped.
router.post("/", async (req, res) => {
  const { title, description = "" } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required." });
  }

  const addedDate = new Date();
  const { day4Date, day7Date } = Todo.computeRecallDates(addedDate);

  const todo = await Todo.create({
    title: title.trim(),
    description: description.trim(),
    addedDate,
    day4Date,
    day7Date,
  });

  res.status(201).json(todo);
});

// Edit content only - title/description. Dates are immutable at the schema
// level, so this can never touch them even if someone sends them.
router.patch("/:id", async (req, res) => {
  const { title, description } = req.body;
  const update = {};
  if (title !== undefined) {
    if (!title.trim()) return res.status(400).json({ error: "Title can't be empty." });
    update.title = title.trim();
  }
  if (description !== undefined) update.description = description.trim();

  const todo = await Todo.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!todo) return res.status(404).json({ error: "Todo not found." });
  res.json(todo);
});

// Toggle the day4 or day7 checkpoint circle. Only allowed once that
// checkpoint's date has arrived (same rule enforced again on the client).
router.patch("/:id/checkpoint", async (req, res) => {
  const { node } = req.body; // "day4" | "day7"
  if (node !== "day4" && node !== "day7") {
    return res.status(400).json({ error: "node must be 'day4' or 'day7'." });
  }

  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).json({ error: "Todo not found." });

  const checkpointDate = node === "day4" ? todo.day4Date : todo.day7Date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkpointDay = new Date(checkpointDate);
  checkpointDay.setHours(0, 0, 0, 0);

  if (today < checkpointDay) {
    return res.status(400).json({ error: `${node} isn't due yet.` });
  }

  const field = node === "day4" ? "day4Checked" : "day7Checked";
  todo[field] = !todo[field];

  // The 1-4-7 rule is complete once both revision checkpoints are ticked
  // (day 1 is always "done" implicitly) - auto-complete the todo then.
  if (todo.day4Checked && todo.day7Checked) {
    todo.done = true;
  }

  await todo.save();
  res.json(todo);
});

// Mark done / not done (toggle-friendly - client sends the desired state).
router.patch("/:id/done", async (req, res) => {
  const { done } = req.body;
  const todo = await Todo.findByIdAndUpdate(
    req.params.id,
    { done: Boolean(done) },
    { new: true }
  );
  if (!todo) return res.status(404).json({ error: "Todo not found." });
  res.json(todo);
});

// Delete - only allowed once the todo is marked done.
router.delete("/:id", async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).json({ error: "Todo not found." });
  if (!todo.done) {
    return res.status(400).json({ error: "Only completed todos can be removed." });
  }
  await todo.deleteOne();
  res.status(204).end();
});

export default router;
