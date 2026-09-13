import cron from "node-cron";
import webpush from "web-push";
import Todo from "../models/Todo.js";
import PushSubscription from "../models/PushSubscription.js";

const REMINDER_HOUR = 18;   // 6pm - the original day-4 / day-7 reminder
const FOLLOWUP_HOUR = 20;   // 8pm - daily nag while a checkpoint is still unchecked

function isSameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

async function sendPushToAll(payload) {
  const subs = await PushSubscription.find();
  const body = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          body
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ endpoint: sub.endpoint });
        } else {
          console.error("Push failed:", err.statusCode, err.message);
        }
      }
    })
  );
}

async function sendInitialReminders(now) {
  const candidates = await Todo.find({
    done: false,
    $or: [{ day4ReminderSent: false }, { day7ReminderSent: false }],
  });

  for (const todo of candidates) {
    if (!todo.day4ReminderSent && isSameCalendarDay(todo.day4Date, now)) {
      await sendPushToAll({
        title: "Day 4 revision due",
        body: `Time to revise: "${todo.title}"`,
        todoId: todo._id.toString(),
      });
      todo.day4ReminderSent = true;
      await todo.save();
    }
    if (!todo.day7ReminderSent && isSameCalendarDay(todo.day7Date, now)) {
      await sendPushToAll({
        title: "Day 7 revision due",
        body: `Final recall check: "${todo.title}"`,
        todoId: todo._id.toString(),
      });
      todo.day7ReminderSent = true;
      await todo.save();
    }
  }
}

// Nags at 8pm, once per day, for any checkpoint whose date has already
// passed but hasn't been ticked green yet - keeps going until it's checked.
async function sendFollowupReminders(now) {
  const today0 = startOfDay(now);

  const candidates = await Todo.find({
    done: false,
    $or: [{ day4Checked: false }, { day7Checked: false }],
  });

  for (const todo of candidates) {
    const day4Overdue = !todo.day4Checked && startOfDay(todo.day4Date) < today0;
    const day4NotSentToday =
      !todo.day4LastFollowupSent || !isSameCalendarDay(todo.day4LastFollowupSent, now);

    if (day4Overdue && day4NotSentToday) {
      await sendPushToAll({
        title: "Still missing: day 4 revision",
        body: `You haven't ticked off day 4 for "${todo.title}" yet.`,
        todoId: todo._id.toString(),
      });
      todo.day4LastFollowupSent = now;
      await todo.save();
    }

    const day7Overdue = !todo.day7Checked && startOfDay(todo.day7Date) < today0;
    const day7NotSentToday =
      !todo.day7LastFollowupSent || !isSameCalendarDay(todo.day7LastFollowupSent, now);

    if (day7Overdue && day7NotSentToday) {
      await sendPushToAll({
        title: "Still missing: day 7 revision",
        body: `You haven't ticked off day 7 for "${todo.title}" yet.`,
        todoId: todo._id.toString(),
      });
      todo.day7LastFollowupSent = now;
      await todo.save();
    }
  }
}

async function checkAndSendReminders() {
  const now = new Date();
  if (now.getHours() === REMINDER_HOUR) {
    await sendInitialReminders(now);
  }
  if (now.getHours() === FOLLOWUP_HOUR) {
    await sendFollowupReminders(now);
  }
}

export function startReminderCron() {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL || "you@example.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  cron.schedule("* * * * *", () => {
    checkAndSendReminders().catch((err) => console.error("Reminder job error:", err));
  });
}