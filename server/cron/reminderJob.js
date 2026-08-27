import cron from "node-cron";
import webpush from "web-push";
import Todo from "../models/Todo.js";
import PushSubscription from "../models/PushSubscription.js";

const REMINDER_HOUR = 18; // 6pm, local server time - set TZ env var to your timezone

function isSameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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
        // 410/404 means the subscription is dead (uninstalled, expired) - clean it up.
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ endpoint: sub.endpoint });
        } else {
          console.error("Push failed:", err.statusCode, err.message);
        }
      }
    })
  );
}

async function checkAndSendReminders() {
  const now = new Date();
  if (now.getHours() !== REMINDER_HOUR) return;

  const dueDay4 = await Todo.find({
    done: false,
    day4ReminderSent: false,
  });
  const dueDay7 = await Todo.find({
    done: false,
    day7ReminderSent: false,
  });

  for (const todo of dueDay4) {
    if (isSameCalendarDay(todo.day4Date, now)) {
      await sendPushToAll({
        title: "Day 4 revision due",
        body: `Time to revise: "${todo.title}"`,
        todoId: todo._id.toString(),
      });
      todo.day4ReminderSent = true;
      await todo.save();
    }
  }

  for (const todo of dueDay7) {
    if (isSameCalendarDay(todo.day7Date, now)) {
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

export function startReminderCron() {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL || "you@example.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  // Runs every minute; only actually sends during the 6pm hour (see REMINDER_HOUR),
  // and day4ReminderSent/day7ReminderSent stop duplicate sends within that hour.
  cron.schedule("* * * * *", () => {
    checkAndSendReminders().catch((err) => console.error("Reminder job error:", err));
  });
}
