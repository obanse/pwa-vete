const STATIC_CACHE = 'static-v18';
const DYNAMIC_CACHE = 'dynamic-v2';
const STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
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
];

/**
 * install Service Worker and activate static caching
 */
self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker...', event);
    event.waitUntil(
        // create static cache
        caches.open(STATIC_CACHE).then(function (cache) {
            console.log('[Service Worker] Precaching App Shell', event);
            return cache.addAll(STATIC_FILES);
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
                    if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
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
 * Helper function to check if a certain string is in an array
 * @param string
 * @param array
 * @returns {boolean}
 */
function isInArray(string, array) {
    // for (let i = 0; i < array.length; i++)
    //     if (array[i] === string)
    //         return true;
    // return false;
    let cachePath;
    if (string.indexOf(self.origin) === 0) {
        // console.log('matched ', string);
        cachePath = string.substring(self.origin.length);
    } else {
        cachePath = string;
    }
    return array.indexOf(cachePath) > -1;
}

/**
 * strategy: Cache, then Network with Dynamic Caching
 * fetch requests and inspect cache first
 */
self.addEventListener('fetch', function (event) {
    let url = 'https://httpbin.org/get';

    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            caches.open(DYNAMIC_CACHE)
                .then(cache => {
                    return fetch(event.request)
                        .then(res => {
                            cache.put(event.request, res.clone());
                            return res;
                        })
                        .catch(err => {
                            console.log(err);
                        })
                })
        );
    } else if (isInArray(event.request.url, STATIC_FILES)) {
        // console.log('From Static Cache', event.request.url);
        event.respondWith(caches.match(event.request));
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    } else {
                        return fetch(event.request)
                            .then(response => {
                                return caches.open(DYNAMIC_CACHE)
                                    .then(cache => {
                                        cache.put(event.request.url, response.clone());
                                    return response;
                                });
                            })
                            .catch(err => {
                                return caches.open(STATIC_CACHE)
                                    .then(cache => {
                                        if (event.request.url.indexOf('/help'))
                                            return cache.match('/offline.html');
                                    })
                            });
                    }
                })
        );
    }
});

/**
 * strategy: Cache with Network Fallback
 * fetch requests and inspect cache first
 */
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.match(event.request).then(response => {
//             // if request is in cache -> the response will be not null
//             if (response) {
//                 return response;
//             } else {
//                 // else return the response from the original request
//                 return fetch(event.request).then(response => {
//                     // create dynamic cache
//                     return caches.open(DYNAMIC_CACHE).then(cache => {
//                         // then put the key value pair of request url and a clone of the response, ...
//                         // because it will be consumed
//                         cache.put(event.request.url, response.clone());
//                         return response;
//                     });
//                 }).catch(err => {
//                     return caches.open(STATIC_CACHE).then(cache => {
//                         return cache.match('/offline.html');
//                     })
//                 });
//             }
//         })
//     );
// });

/**
 * strategy: Cache only
 * - fetch requests and inspect cache only
 */
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.match(event.request)
//     );
// });

/**
 * strategy: Network only
 * fetch requests and access the network only
 */
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         fetch(event.request)
//     );
// });

/**
 * strategy: Network with Cache Fallback
 * fetch requests and access the network first, if this fails inspect the cache
 */
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         fetch(event.request).catch(err => {
//             return caches.match(event.request);
//         })
//     );
// });

/**
 * strategy: Network with Cache Fallback and Dynamic Caching
 * fetch requests and access the network first, if this fails inspect the caches
 */
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         fetch(event.request).then(response => {
//             return caches.open(DYNAMIC_CACHE).then(cache => {
//                 cache.put(event.request.url, response.clone());
//                 return response;
//             });
//         }).catch(err => {
//             return caches.match(event.request);
//         })
//     );
// });

