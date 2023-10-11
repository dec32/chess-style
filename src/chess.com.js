// fixing for homepage
const browser = window.browser || chrome
const root = document.querySelector(':root').style
const keys = []
for (let color of ["black", "white"]) {
    for (let piece of ["king", "queen", "rook", "bishop", "knight", "pawn"]) {
        keys.push(`${color}_${piece}`)
    }
}

let obj = browser.storage.sync.get(keys, obj=>{
    for (let key of Object.keys(obj)) {
        let split = key.split("_")
        inject(split[0], split[1], obj[key])
    }
})

browser.runtime.onMessage.addListener(msg => {
    if (msg.url) {
        inject(msg.color, msg.piece, msg.url)
    } else {
        revert(msg.color, msg.piece)
    }
})


function inject(color, piece, url) {
    let id = `${color[0]}${piece=="knight"?'n':piece[0]}`
    if (url.startsWith("data:")) {
        url = getBlobURL(url)
    }
    root.setProperty(`--theme-piece-set-${id}`, `url(${url})`)
}

function revert(color, piece) {
    let id = `${color[0]}${piece=="knight"?'n':piece[0]}`
    root.setProperty(`--theme-piece-set-${id}`, "")
}

function getBlobURL(dataURL) {
    let arr = dataURL.split(',')
    let mime = arr[0].match(/:(.*?);/)[1]
    let bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    let blob = new Blob([u8arr], {type:mime});
    return URL.createObjectURL(blob);
}