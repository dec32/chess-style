import browser from "./browser.js"
import storage from "./storage.js"

const sites = [
    {
        url: "*://lichess.org/*",
        css: (color, piece, url, tab) => `.is2d .${color}.${piece} {background-image: url(${url})!important}`  
    },
    {
        url: "*://www.chess.com/*",
        css: async function (color, piece, url, tab) {
            if (tab.url.endsWith("chess.com/home")) {
                let id = `${color[0]}${piece=="knight"?'n':piece[0]}`
                if (url.startsWith("data:")) {
                    // convert all data URLs blob URLs for the homepage
                    // fixme: it flickers
                    let results = await browser.scripting.executeScript({ target: { tabId: tab.id }, func: getBlobURL, args: [url] })
                    if (results.find(result => result.error)) {
                        console.error("Error detected in injected scripts.")
                        console.error(results)
                    } else {
                        url = results[0].result
                        console.debug(`Data URL converted to '${url}'`)
                    }
                }
                return `:root {--theme-piece-set-${id}: url(${url})!important}`
            } else {
                return `.${id}{background-image: url(${url})!important}`
            }
        }


    }
]

// on start up
storage.forEachPieces(apply)

// listen for new tabs
browser.webNavigation.onCommitted.addListener(detail => {
    storage.forEachPieces((color, piece, url)=>{
        apply(color, piece, url, detail.tabId)
    })
})


browser.runtime.onMessage.addListener(async (msg, sender, respond) => {
    if (msg.url) {
        await apply(msg.color, msg.piece, msg.url)
        storage.setPiece(msg.color, msg.piece, msg.url)
    } else {
        await revert(msg.color, msg.piece)
        storage.removePiece(msg.color, msg.piece)
    }
    return true
})


async function apply(color, piece, url, tabId) {
    if (!tabId) {
        await revert(color, piece)
    }
    for (let site of sites) {
        let tabs = await browser.tabs.query({url:site.url})
        for (let tab of tabs) {
            if (tabId && tabId != tab.id) {
                continue;
            }
            let target = {tabId: tab.id}
            let css = await site.css(color, piece, url, tab)
            await browser.scripting.insertCSS({ target: target, css: css })
            console.debug(`Tab #${tab.id}(${site.url}): Injected CSS for ${color} ${piece}."`)
            // store the css so that it can be reverted
            putInjected(site, color, piece, css)
        }
    }
}


async function revert(color, piece) {
    for (let site of sites) {
        let css = delInjected(site, color, piece)
        if (!css) {
            return
        }
        let tabs = await browser.tabs.query({url:site.url})
        for (let tab of tabs) {
            let target = { tabId: tab.id }
            await browser.scripting.removeCSS({ target: target, css: css })
            console.debug(`Tab #${tab.id}(${site.url}): Removed CSS for ${color} ${piece}.`)
        }
    }
}


function putInjected(site, color, piece, css) {
    if (!site.injected) {
        site.injected = new Map()
    }
    let key = `${color}_${piece}`
    site.injected[key] = css
}

function delInjected(site, color, piece) {
    if (!site.injected) {
        return null
    }
    let key = `${color}_${piece}`
    let css = site.injected[key]
    site.injected.delete(key)
    return css
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