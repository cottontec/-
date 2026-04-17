// 英検アプリ サービスワーカー (v2)
const CACHE_NAME = "eiken-app-v2";
const OFFLINE_URL = "/offline";

// 起動時にキャッシュしておくページ
const PRECACHE = [
  "/",
  "/offline",
  "/auth",
  "/history",
  "/analytics",
  "/bookmarks",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE).catch(() => null)
    )
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // 自オリジン以外はキャッシュ対象外
  if (url.origin !== location.origin) return;

  // ナビゲーション(HTML): network-first → fallback to cache → offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 静的アセット: stale-while-revalidate
  if (/\.(?:js|css|png|jpg|jpeg|svg|gif|webp|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then((res) => {
          cache.put(request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // PDF: network-first（巨大なのでキャッシュは初回成功時のみ、ベストエフォート）
  if (url.pathname.endsWith(".pdf")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // その他のGET: ネット優先、失敗時のみキャッシュ
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// プッシュ通知
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "英検演習";
  const options = {
    body: data.body || "新しいお知らせがあります",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});
