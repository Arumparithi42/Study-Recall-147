import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import todoRoutes from "./routes/todos.js";
import pushRoutes from "./routes/push.js";
import { startReminderCron } from "./cron/reminderJob.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/todos", todoRoutes);
app.use("/api/push", pushRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    startReminderCron();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
