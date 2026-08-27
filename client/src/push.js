import { api } from "./api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function enablePushReminders() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("This browser doesn't support push notifications.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.ready;
  const { key } = await api.getVapidKey();

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });

  await api.subscribePush(subscription.toJSON());
  return true;
}
