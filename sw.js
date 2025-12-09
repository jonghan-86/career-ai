// 매우 단순한 PWA 캐시 (선택 사항)
// 캐시 이름에 버전을 포함시키면 나중에 업데이트가 쉬움
const CACHE_NAME = "career-ai-cache-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./main.js",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
