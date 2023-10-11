import browser from "./browser.js"

const s = browser.storage.sync
const keys = []
for (let color of ["black", "white"]) {
    for (let piece of ["king", "queen", "rook", "bishop", "knight", "pawn"]) {
        keys.push(`${color}_${piece}`)
    }
}

export default {
    // The default api is not friendly towards dynamic keys
    set: async function(key, value=null) {
        if (value) {
            let entry = {}
            entry[key] = value
            await s.set(entry)
        } else {
            await s.set(key)
        }
    },

    getTheme: async function() {
        let obj = await s.get("theme")
        return obj.theme
    },

    setTheme: async function(theme) {
        await s.set({theme: theme})
    },

    forEachPieces: async function(fn) {
        let promises = []
        let obj = await s.get(keys)
        for (let key of Object.keys(obj)) {
            let split = key.split("_")
            promises.push(Promise.resolve(fn(split[0], split[1], obj[key])))
        }
        await Promise.all(promises)
    },

    getPieces: async function() {
        let obj = await s.get(keys)
        let pieces = []
        for (let key of Object.keys(obj)) {
            let split = key.split("_")
            pieces.push({color:split[0], piece:split[1], url: obj[key]})
        }
        return pieces;
    },

    setPiece: async function(color, piece, url) {
        let key = `${color}_${piece}`
        let entry = {}
        entry[key] = url
        await s.set(entry)
    },

    removePiece: async function(color, piece) {
        let key = `${color}_${piece}`
        await s.remove(key)
    }
}