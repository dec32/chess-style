// chrome-compatitiy
const browser = {
    storage: chrome.storage,
    runtime: chrome.runtime,
    tabs: chrome.tabs
}

// common parts, just copy-paste and don't bother importing
alter(apply, revert)
function alter(apply, revert) {
    // recover from storage
    browser.storage.local.get().then(obj => {
        for (let key of Object.keys(obj)) {
            if (key == "theme") {
                continue
            }
            split = key.split("_")
            color = split[0]
            piece = split[1]
            url = obj[key]
            if (url != "") {
                apply(color, piece, url)
            }
        }
    })
    // listen changes from popup
    browser.runtime.onMessage.addListener(msg => {
        if (msg.url == "") {
            revert(msg.color, msg.piece)
        } else {
            apply(msg.color, msg.piece, msg.url)
        }
    });
}
    

function apply(color, piece, url) {
    // fixme: way too brutal
    console.debug(`now applying ${color} ${piece}`)
    let image = `url(${url})`
    applyImage(color, piece, image)
    for (let timeout of [1,2,3,4,5,6,7,8]) {
        setTimeout(() => applyImage(color, piece, image), timeout * 1000);
    }
}

function applyImage(color, piece, image) {
    console.debug(`now applying image to ${color} ${piece}`)
    document.querySelectorAll(seletcor(color, piece)).forEach(node => node.style.backgroundImage = image)
}

function revert(color, piece) {
    document.querySelectorAll(seletcor(color, piece)).forEach(node => node.style.backgroundImage = "")
}

function seletcor(color, piece) {
    return `.${color[0]}${abbr(piece)}`
}

function abbr(piece) {
    if (piece == "knight") {
        return 'n'
    }
    return piece[0]
}