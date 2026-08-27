import { Router } from "express";
import PushSubscription from "../models/PushSubscription.js";

const router = Router();

// Called once by the PWA after the user grants notification permission.
router.post("/subscribe", async (req, res) => {
  const sub = req.body;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return res.status(400).json({ error: "Invalid subscription." });
  }

  await PushSubscription.findOneAndUpdate(
    { endpoint: sub.endpoint },
    { endpoint: sub.endpoint, keys: sub.keys },
    { upsert: true }
  );

  res.status(201).json({ ok: true });
});

router.get("/vapid-public-key", (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

export default router;
