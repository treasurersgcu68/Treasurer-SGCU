const CACHE_NAME = "treasurer-sgcu-shell-v49";
const APP_SHELL_URLS = [
  "./",
  "./index.html",
  "./css/style.css?v=20260430-8",
  "./js/app.core.js",
  "./js/app.helpers.js?v=20260416-1",
  "./js/app.file-links.js?v=20260417-1",
  "./js/app.data.js",
  "./js/app.project-ui.js",
  "./js/app.project-modal.js",
  "./js/app.charts.js",
  "./js/app.pie.js",
  "./js/app.sorting-auth.js?v=20260430-6",
  "./js/app.org.js?v=20260428-1",
  "./js/app.motion.js",
  "./js/app.feature-loader.js?v=20260430-9",
  "./js/app.init.js?v=20260430-1",
  "./js/app.calendar.js",
  "./js/app.web-push.js",
  "./manifest.webmanifest",
  "./img/icons/icon-192.png",
  "./img/icons/icon-512.png"
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

  const updateCache = async () => {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseClone);
    }
    return networkResponse;
  };

  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((cachedResponse) => {
        const networkPromise = updateCache().catch(() => cachedResponse || caches.match("./index.html"));
        return cachedResponse || networkPromise;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        event.waitUntil(updateCache().catch(() => null));
        return cachedResponse;
      }
      return updateCache();
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
