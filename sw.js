const CACHE_NAME = "treasurer-sgcu-shell-v6";
const APP_SHELL_URLS = [
  "./",
  "./index.html",
  "./css/style.css?v=20260415-7",
  "./js/app.web-push.js",
  "./manifest.webmanifest",
  "./img/icons/icon-192.png",
  "./img/icons/icon-512.png",
  "./img/logo_treasurur%20jpg1.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
          return null;
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return networkResponse;
      });
    })
  );
});

self.addEventListener("push", (event) => {
  const fallbackUrl = "./";
  const fallbackTitle = "Treasurer SGCU68";
  const fallbackBody = "มีการอัปเดตใหม่";
  const fallbackIcon = "img/icons/icon-192.png";
  const fallbackBadge = "img/icons/icon-192.png";

  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = { body: event.data ? event.data.text() : fallbackBody };
  }

  const title = (payload.title || fallbackTitle).toString();
  const body = (payload.body || fallbackBody).toString();
  const url = (payload.url || fallbackUrl).toString();
  const icon = (payload.icon || fallbackIcon).toString();
  const badge = (payload.badge || fallbackBadge).toString();
  const data = {
    ...(payload.data || {}),
    url
  };

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawTargetUrl = (event.notification?.data?.url || "./").toString();
  const targetUrl = new URL(rawTargetUrl, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          const clientUrl = new URL(client.url, self.location.origin).href;
          if (clientUrl === targetUrl) return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
