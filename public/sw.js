const CACHE_STATIC = 'static-v2';
const CACHE_DYNAMIC = 'dynamic-v1';

/**
 * install Service Worker and activate static caching
 */
self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker...', event);
    event.waitUntil(
        // create static cache
        caches.open(CACHE_STATIC).then(function (cache) {
            console.log('[Service Worker] Precaching App Shell', event);
            return cache.addAll([
                '/',
                '/index.html',
                '/src/js/app.js',
                '/src/js/feed.js',
                '/src/js/promise.js',
                '/src/js/fetch.js',
                '/src/js/material.min.js',
                '/src/css/app.css',
                '/src/css/feed.css',
                '/src/css/mystyle.css',
                '/src/images/main-image.jpg',
                'https://fonts.googleapis.com/css?family=Roboto:400,700',
                'https://fonts.googleapis.com/icon?family=Material+Icons',
                'https://fonts.gstatic.com/s/materialicons/v55/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
                'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
            ]);
        })
    );
});

/**
 * activate Service Worker and clean up caches
 */
self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker...', event);
    event.waitUntil(
        // get all cache names
        caches.keys()
            .then(keyList => {
                // map calls the given callback function once for each keyList element in the array
                return Promise.all(keyList.map(key => {
                    if (key !== CACHE_STATIC && key !== CACHE_DYNAMIC) {
                        // if not equal with current aimed cache names then remove/delete the cache
                        console.log('[Service Worker] Removing old cache: ', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

/**
 * fetch requests and inspect cache first
 * strategy: Cache then Network
 */
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // if request is in cache -> the response will be not null
                if (response) {
                    return response;
                } else {
                    // else return the response from the original request
                    return fetch(event.request)
                        .then(response => {
                            // create dynamic cache
                            return caches.open(CACHE_DYNAMIC)
                                .then(cache => {
                                    // then put the key value pair of request url and a clone of the response, ...
                                    // because it will be consumed
                                    cache.put(event.request.url, response.clone());
                                    return response;
                                })
                        });
                }
            })
    );
});
