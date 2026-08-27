import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Single-user app, so we just keep every unique subscription (one per
// browser/device you install the PWA on) and push to all of them.
const pushSubscriptionSchema = new Schema(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default model("PushSubscription", pushSubscriptionSchema);
