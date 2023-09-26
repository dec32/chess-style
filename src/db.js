// drop() // for debugging
const version = 1
const ttl = 5000


let db
function open() {
    if (!conf.db) {
        return Promise.reject("IndexedDB is configured to be disabled.")
    }
    if (db) {
        refreshTTL()
        return Promise.resolve(db)
    }
    return new Promise((resolve, reject) => {
        let req = indexedDB.open("db", version)
        req.onsuccess = e => {
            console.debug("IndexedDB opened.")
            refreshTTL()
            db = req.result
            resolve(req.result)
        }
        req.onerror = e => { 
            console.warn("Couldn't open IndexedDB.")
            reject(e.target.error)
        }
        req.onupgradeneeded = e => {
            e.target.result.createObjectStore("files")
            console.debug("Object storage(s) created.")
        }
    })
}

let timer
function refreshTTL() {
    clearTimeout(timer)   
    timer = setTimeout(() => {
        db.close()
        db = null
        console.debug("IndexDB closed.")
    }, ttl);
    console.debug(`IndexedDB closing in ${ttl} ms.`)
}


export async function setPiece(color, piece, file) {
    let db = await open()
    let transaction = db.transaction(["files"], "readwrite");
    let objectStore = transaction.objectStore("files")
    let key = `${color}_${piece}`

    await promise(objectStore.put(file, key))
    file = await promise(objectStore.get(key))
    return URL.createObjectURL(file)
}


function promise(request) {
    return new Promise((resolve, reject)=> {
        request.onsuccess = e => resolve(e.target.result)
        request.onerror = e => reject(e.target.error)
    })
}


function drop() {
    let req = indexedDB.deleteDatabase("db")
    req.onsuccess = function () {
        console.log("Deleted database successfully")
    };
    req.onerror = function () {
        console.log("Couldn't delete database")
    };
    req.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked")
    };
}