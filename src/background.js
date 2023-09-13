import browser from "./browser.js"
import storage from "./storage.js"

const injection = new Map()
const sites = [
    {
        url: "*://lichess.org/*",
        css: (color, piece, url) => `.is2d .${color}.${piece} {background-image: url(${url})!important}`  
    },
    {
        url: "*://www.chess.com/*",
        css: (color, piece, url) => `.${color[0]}${piece=="knight"?'n':piece[0]} {background-image: url(${url})!important}`
    }
]


// on start up
storage.forEachPieces(apply)

// listen for new tabs
browser.webNavigation.onCommitted.addListener(e => {
    storage.forEachPieces((color, piece, url)=>{
        apply(color, piece, url, true)
    })
})


// listen for changes from popup
browser.runtime.onMessage.addListener(msg => {
    if (msg.url) {
        apply(msg.color, msg.piece, msg.url)
        storage.setPiece(msg.color, msg.piece, msg.url)
    } else {
        revert(msg.color, msg.piece)
        storage.removePiece(msg.color, msg.piece)
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
                browser.scripting.insertCSS({target: target, css: css}, ()=>{
                    // store the css so that it can be reverted
                    putInjected(site, color, piece, css)
                })
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
                console.warn(injection)
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


// todo: optimize key length
function putInjected(engine, color, piece, css) {
    let key = `${engine.url}-${color}-${piece}`
    injection[key] = css
}

function delInjected(engine, color, piece) {
    let key = `${engine.url}-${color}-${piece}`
    let css = injection[key]
    if (css) {
        injection.delete(key)
        return css
    } else {
        return null
    }
}