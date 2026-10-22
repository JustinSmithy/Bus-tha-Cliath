// Network-first service worker: always tries the live site so updates show up,
// and falls back to the saved copy only when you're offline.
const CACHE = 'duty-portal-v' + '2026-10-21';

self.addEventListener('install', function(e){ self.skipWaiting(); });

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys()
      .then(function(keys){ return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  const req = e.request;
  if(req.method !== 'GET' || !/^https?:/.test(req.url)) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(function(res){
        if(res && res.ok && new URL(req.url).origin === location.origin){
          const copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      })
      .catch(function(){
        return caches.match(req).then(function(hit){ return hit || caches.match('./') || caches.match('index.html'); });
      })
  );
});
