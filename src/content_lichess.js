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
    browser.storage.local.get(null).then(obj => {
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

// impl for diffrent sites
function apply(color, piece, url) {
    console.debug("lichess.apply")
    document.querySelectorAll(seletcor(color, piece)).forEach(node => node.style.backgroundImage=`url(${url})`)
}

function revert(color, piece) {
    document.querySelectorAll(seletcor(color, piece)).forEach(node => node.style.backgroundImage = "")
}

function seletcor(color, piece) {
    return `piece.${color}.${piece}`
}
