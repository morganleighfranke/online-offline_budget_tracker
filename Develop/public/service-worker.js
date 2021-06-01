const FILES_TO_CACHE = [
    '/',
    '/index.js',
    '/manifest.json',
    '/style.css',
    '/indexedDB.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
  ];
  
  const PRECACHE = 'precache-v1';
  const RUNTIME = 'runtime';
  
  self.addEventListener("install", function(event) {
    // Perform install steps
    event.waitUntil(
      caches.open(PRECACHE).then(function(cache) {
        console.log("Opened cache");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  });
  self.addEventListener("fetch", function(event) {
    // cache all get requests to /api routes
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(RUNTIME).then(cache => {
          return fetch(event.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(event.request);
            });
        }).catch(err => console.log(err))
      );
      return;
    }
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request).then(function(response) {
          if (response) {
            return response;
          } else if (event.request.headers.get("accept").includes("text/html")) {
            // return the cached home page for all requests for html pages
            return caches.match("/");
          }
        });
      })
    );
  });