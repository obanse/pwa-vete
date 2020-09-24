
var deferredPrompt;

if (!window.Promise) {
    window.Promise = Promise;
}

/**
 * register Service Worker
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function() {
            console.log("Service Worker registered!");
        });
}

window.addEventListener('beforeinstallprompt', function (event) {
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});
