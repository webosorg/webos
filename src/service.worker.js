const CACHE_NAME = 'webos_v01';

const MAX_AGE = 86400000;

const cacheUrls = [
  '/index.html',
  '/init.js',
  '/build/bundle.js',
  '/'
];

self.addEventListener('install', function(event) {
  // installation

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(
        function(cache) {
          console.log('System log ::: Installing process ... ', cache);
          return cache.addAll(cacheUrls)
            .then(
              function() {
                console.log('System log ::: ServiceWorker installed ::: ', cache);
              }
            )
            .catch(
              function(err) {
                console.error('System error ::: ', err);
              }
            );
        }
      )
      .catch(
        function(err) {
          console.error('System error ::: ', err);
        }
      )
  );
});

self.addEventListener('activate', function(event) {
  // activation
  console.log('System log ::: ServiceWorker activated ::: ', event);
});

self.addEventListener('fetch', function(event) {
  console.log('Log ::: Service Worker got fetch event ::: ', event);
  console.log('Log ::: Searching in cache ...');
  event.respondWith(
    caches.match(event.request).then(
      function(cachedResponse) {

        console.log('Log ::: Found in cache ::: ', cachedResponse);

        let lastModified, fetchRequest;

        if (cachedResponse) {

          lastModified = new Date(cachedResponse.headers.get('last-modified'));

          if (lastModified && (Date.now() - lastModified.getTime()) > MAX_AGE) {
            fetchRequest = event.request.clone();

            return fetch(fetchRequest)
                      .then(
                        function(response) {
                          if (!response || response.status !== 200) {
                            return cachedResponse;
                          }

                          cached.open(CACHE_NAME)
                                .then(
                                  function(cache) {
                                    cache.put(event.request, response.clone());
                                  }
                                );
                          return response;
                        }
                      )
                      .catch(
                        function() {
                          return cachedResponse;
                        }
                      );
          }

          return cachedResponse;
        }

        console.log('Log ::: Not Found in cache ', event);

        return fetch(event.request);
      }
    )
  );
});