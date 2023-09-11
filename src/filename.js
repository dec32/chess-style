const colors = {b: "black", w: "white"}
const pieces = {k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn"}
const colorAbbrs = Object.keys(colors)
const pieceAbbrs = Object.keys(pieces)
const colorFullNames = Object.values(colors)
const pieceFullNames = Object.values(pieces)

export function analyze(name) {
    let words = name.toLowerCase().split(/[ ._\-]/)
    let piece = null
    let color = null

    // recognize pieces and colors in their full names (white-bishop_with_shadow.svg)
    for (let word of words) {
        if (pieceFullNames.includes(word)) {
            piece = word
        }
        if (colorFullNames.includes(word)) {
            color = word
        }
        if (piece && color) {
            return {color: color, piece: piece}
        }
    }

    // only colors are no in their full names (w-bishop-256p.png)
    if (piece && !color) {
        for (let word of words) {
            if (colorAbbrs.includes(word)) {
                color = colors[word]
                return {color: color, piece: piece}
            }
        }
        return null
    }

    // only pieces are no in their full names (white-b.svg)
    if (!piece && color) {
        for (let word of words) {
            if (pieceAbbrs.includes(word)) {
                piece = pieces[word]
                return {color: color, piece: piece}
            }
        }
        return null
    }

    // colors and pieces are both in abbr (wb.svg)
    for (let word of words) {
        if (word.length == 2) {
            let color = colors[word[0]]
            let piece = pieces[word[1]]
            if (color && piece) {
                return {color: color, piece: piece}
            }
        }
    }
    return null
}