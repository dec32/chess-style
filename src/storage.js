import browser from "./browser.js"

const s = browser.storage.local
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
        let obj = await s.get(keys)
        for (let key of Object.keys(obj)) {
            let split = key.split("_")
            await fn(split[0], split[1], obj[key])
        }
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