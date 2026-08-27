# Recall — 1-4-7 Study Tracker

A small PWA that logs what you studied and reminds you to revise it on **day 4**
and **day 7** (from the day you added it) at **6pm**, via real push notifications.

Stack: React + Vite + Tailwind (frontend, installable PWA) · Express + MongoDB
(backend) · `web-push` + `node-cron` for scheduled reminders.

## How it works

- Add an entry (title + optional description) → its date is locked in as `addedDate`.
- `day4Date` and `day7Date` are computed once, at creation, and never change.
- A cron job on the server checks every minute; when the clock hits 6pm on
  `day4Date` or `day7Date` for an unfinished entry, it pushes a notification
  to every device you've enabled reminders on.
- Editing only ever touches `title`/`description` — the dates are immutable
  at the database schema level, so this can't be bypassed even by a bad request.
- **Remove** is disabled until the entry is marked **Done**.

## 1. Backend setup

```bash
cd server
npm install
npm run generate-vapid        # prints a VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY pair
cp .env.example .env          # paste the keys in, add your MongoDB Atlas URI
npm run dev
```

Set `TZ` in `.env` to your own timezone (e.g. `Asia/Kolkata`) — the 6pm check
uses the server's local time, so this matters.

## 2. Frontend setup

```bash
cd client
npm install
cp .env.example .env          # point VITE_API_BASE at your backend
npm run dev
```

Open the app, tap **"Turn on 6pm reminders"** once to grant notification
permission and register your device for push.

## 3. Deploying (same pattern as your other MERN projects)

- **MongoDB Atlas** — create a free cluster, get the connection string for `MONGODB_URI`.
- **Render** — deploy `server/` as a Web Service. Add all `.env` values
  (including `TZ` and the VAPID keys) as environment variables there.
- **Vercel** — deploy `client/` as the frontend. Set `VITE_API_BASE` to your
  Render backend URL (e.g. `https://your-app.onrender.com/api`).
- Install the deployed site as a PWA on your phone (Chrome → "Add to Home
  screen") so push notifications work even when the tab isn't open.

## Notes / things to swap later

- `public/icon-192.png` and `icon-512.png` are simple placeholder marks —
  swap them for your own if you want a custom home-screen icon.
- This is single-user by design (no auth) — every push subscription just
  gets every reminder. Fine for personal use on your own devices.
- If you'd rather not deal with push infra right now, the reminder logic
  works identically without it — you'd just check the app itself daily
  instead of getting a phone notification.
