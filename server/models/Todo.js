import mongoose from "mongoose";

const { Schema, model } = mongoose;

// The 1-4-7 rule: a study entry is added on "addedDate".
// It must be revised on day 4 and mastered/reviewed again on day 7,
// both counted from addedDate, both reminders fired at 18:00 local time.
const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },

    // Locked forever after creation - this is what the 4/7 day math is based on.
    addedDate: { type: Date, required: true, immutable: true },
    day4Date: { type: Date, required: true, immutable: true },
    day7Date: { type: Date, required: true, immutable: true },
    day4Checked: { type: Boolean, default: false },
    day7Checked: { type: Boolean, default: false },
    done: { type: Boolean, default: false },

    // Prevents the cron job from sending the same reminder twice.
    day4ReminderSent: { type: Boolean, default: false },
    day7ReminderSent: { type: Boolean, default: false },
    // Tracks the last calendar day an 8pm nag was sent for each checkpoint,
    // so it fires once per day (not once per cron tick) until checked.
    day4LastFollowupSent: { type: Date, default: null },
    day7LastFollowupSent: { type: Date, default: null },
  },
  { timestamps: true }
);

// Helper used at creation time to compute the locked recall dates.
todoSchema.statics.computeRecallDates = function (addedDate) {
  const day4Date = new Date(addedDate);
  day4Date.setDate(day4Date.getDate() + 4);

  const day7Date = new Date(addedDate);
  day7Date.setDate(day7Date.getDate() + 7);

  return { day4Date, day7Date };
};

export default model("Todo", todoSchema);
