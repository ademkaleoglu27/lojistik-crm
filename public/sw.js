// Basit bir service worker: sadece aktive olup client'ları sahipleniyor.
// İleride istersen cache / offline için geliştirebiliriz.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});
