self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Recall";
  const options = {
    body: data.body || "You have a revision due today.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { todoId: data.todoId },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
