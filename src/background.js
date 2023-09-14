import browser from "./browser.js"
import storage from "./storage.js"

const sites = [
    {
        url: "*://lichess.org/*",
        css: (color, piece, url) => `.is2d .${color}.${piece} {background-image: url(${url})!important}`  
    },
    {
        url: "*://www.chess.com/*",
        css: (color, piece, url) => {
            let id = `${color[0]}${piece=="knight"?'n':piece[0]}`
            return `.${id}{background-image: url(${url})!important} :root {--theme-piece-set-${id}: url(${url})!important}`
        }
    }
]

console.debug("background.js is now awakened")

// on start up
storage.forEachPieces(apply)

browser.runtime.onMessage.addListener((msg, sender, respond) => {
    if (msg.tab) {
        // listen for new tabs
        storage.forEachPieces((color, piece, url)=>{
            apply(color, piece, url, true)
        })
        console.debug("message received. now responding.")
        respond("message received");
    } else {
        // listen for changes from popup
        if (msg.url) {
            apply(msg.color, msg.piece, msg.url)
            storage.setPiece(msg.color, msg.piece, msg.url)
        } else {
            revert(msg.color, msg.piece)
            storage.removePiece(msg.color, msg.piece)
        }
    }

})



function apply(color, piece, url, active=null) {
    revert(color, piece)
    console.debug(`Now customizing ${color} ${piece}`)
    for (let site of sites) {
        let css = site.css(color, piece, url)
        browser.tabs.query({url:site.url, active:active}, tabs => {    
            for (let tab of tabs) {
                let target = {tabId: tab.id}
                console.debug(`Inject CSS for ${color} ${piece} into tab #${tab.id} from "${site.url}"."`)
                browser.scripting.insertCSS({ target: target, css: css }, ()=>
                    // store the css so that it can be reverted
                    putInjected(site, color, piece, css)
                )
            }
        })
    }
}

function revert(color, piece) {
    for (let site of sites) {
        let css = delInjected(site, color, piece)
        browser.tabs.query({url:site.url}, tabs => {
            if (!css) {
                console.warn(`Can not find the injected CSS for ${color} ${piece} on "${site.url}" thus reverting would be aborted.`)
                return
            }
            for (let tab of tabs) {
                let target = {tabId: tab.id}
                // store the css so that it can be reverted
                console.debug(`Remove CSS for ${color} ${piece} from tab #${tab.id} from "${site.url}".`)
                browser.scripting.removeCSS({target: target, css: css})
            }
        })
    }
}


function putInjected(site, color, piece, css) {
    if (!site.injected) {
        site.injected = new Map()
    }
    let key = `${color}_${piece}`
    site.injected.put(key, css)
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