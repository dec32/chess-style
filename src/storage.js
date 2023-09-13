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
    set: function(key, value=null) {
        if (value) {
            let entry = {}
            entry[key] = value
            s.set(entry)
        } else {
            s.set(key)
        }
    },

    getTheme: function() {
        return s.get("theme").then(obj => Promise.resolve(obj.theme))
    },

    setTheme: function(theme) {
        return s.set({theme: theme})
    },

    forEachPieces: function(fn) {
        s.get(keys, obj => {
            for (let key of Object.keys(obj)) {
                let split = key.split("_")
                fn(split[0], split[1], obj[key])
            }
        })
    },

    setPiece: function(color, piece, url) {
        let key = `${color}_${piece}`
        let entry = {}
        entry[key] = url
        return s.set(entry)
    },

    removePiece: function(color, piece) {
        let key = `${color}_${piece}`
        return s.remove(key)
    }
}