/**
 * TODO: comment missing!
 */
const dbPromise = idb.openDB('posts-store', 1, {
    upgrade(db) {
        db.createObjectStore('posts', {keyPath: 'id'});
    },
});

/**
 * TODO: comment missing!
 * @param objectStore
 * @param data
 */
function writeData(objectStore, data) {

    return dbPromise.then(db => {
        let tx = db.transaction(objectStore, 'readwrite');
        let store = tx.objectStore(objectStore);
        store.put(data);
        return tx.done;
    });
}

/**
 * TODO: comment missing!
 * @param objectStore
 * @returns {PromiseLike<any> | Promise<any>}
 */
function readAllData(objectStore) {

    return dbPromise
        .then(db => {
            let tx = db.transaction(objectStore, 'readonly');
            let store = tx.objectStore(objectStore);
            return store.getAll();
        });
}

/**
 * TODO: comment missing!
 * @param objectStore
 * @returns {PromiseLike<any> | Promise<any>}
 */
function clearAllData(objectStore) {

    return dbPromise
        .then(db => {
            let tx = db.transaction(objectStore, 'readwrite');
            let store = tx.objectStore(objectStore);
            store.clear();
            return tx.done;
        });
}


function deleteItem(objectStore, id) {
    return dbPromise
        .then(db => {
            let tx = db.transaction(objectStore, 'readwrite');
            let store = tx.objectStore(objectStore);
            store.delete(id);
            return tx.done;
        })
        .then(() => {
            console.log('Item deleted!');
        });
}
