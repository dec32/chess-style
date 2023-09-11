import * as filename from "./filename.js"
import * as style from "./style.js"

// chrome-compatitiy
const browser = {
    storage: chrome.storage,
    runtime: chrome.runtime,
    tabs: chrome.tabs
}

// url parameters
const params = new URLSearchParams(window.location.search)
const tab = params.get("tab")
const uploading = params.get("uploading")

const storage = browser.storage.local
const sites = browser.runtime.getManifest().content_scripts.flatMap(script => script.matches)

// styling
if (tab) {
    document.querySelector(".heading").style.textAlign = "center"
}
style.enable()

// recover from storage and fill up the text inputs
storage.get(obj => {
    console.debug(`storage.get(): ${JSON.stringify(obj)}`)
    for (let key of Object.keys(obj)) {
        let id = key.replace("_", "-")
        let pieceNode = document.querySelector(`#${id}`)
        if (pieceNode) {
            let url = obj[key]
            pieceNode.querySelector("input[type=text]").value = url
        }
    }
})

// listen for url changes
document.querySelectorAll(".url-text-input").forEach(input => {
    input.addEventListener("input", e=> {
        let id = e.target.closest("tr").id.split("-")
        let color = id[0]
        let piece = id[1]
        let url = e.target.value
        saveAndApply(color, piece, url)
    })
})

// listen for uploads (single image)
document.querySelectorAll(".upload-btn").forEach(btn => {
    let input = btn.querySelector("input[type=file]")
    input.addEventListener("input", e => {
        let pieceNode = e.target.closest("tr")
        let id = pieceNode.id.split("-")
        let color = id[0]
        let piece = id[1]

        let file = e.target.files[0]
        let reader = new FileReader()
        reader.addEventListener("load", () => {
            let url = reader.result
            saveAndApply(color, piece, url)
            pieceNode.querySelector("input[type=text]").value = url
        })
        reader.readAsDataURL(file);
    })
})

// listen for upload (folder)
document.querySelector(".upload-set-btn").querySelector("input[type=file]").addEventListener("input", e => {
    for (let file of e.target.files) {
        console.debug(file)
        let id = filename.analyze(file.name)
        if (id == null) {
            console.warn(`Can not recognize file ${file.name}.`)
            continue
        }
        let reader = new FileReader()
        reader.addEventListener("load", () => {
            let url = reader.result
            saveAndApply(id.color, id.piece, url)
            document.querySelector(`#${id.color}-${id.piece}`).querySelector("input[type=text]").value = url
        })
        reader.readAsDataURL(file);   
    }
})

// listen for upload buttons(to trigger the file inputs)
document.querySelectorAll(".upload-btn, .upload-set-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        if (tab) {
            btn.querySelector("input[type=file]").click()
        } else{
            // a popup will close itself (and kill the script) when a file chooser is opened
            // so navigate to a newly openned tab, which does not close itself
            let uploading
            if (e.target.class == "upload-btn") {
                uploading = e.target.closest("tr").id
            } else {
                uploading = "set"
            }
            browser.tabs.create({url: `popup.html?tab=true&uploading=${uploading}`})
            window.close()
        } 
    })
});


// click the file input if the current page is a newly opened tab
if (tab && uploading) {
    // fixme does not click
    if (uploading == "set") {
        document.querySelector(".upload-set-btn").click()
    } else {
        document.querySelector(`#${uploading}`).querySelector("input[type=file]").click()
    }   
}


function saveAndApply(color, piece, url) {
    // store the changes
    let key = `${color}_${piece}`
    let entry = {}
    entry[key] = url
    storage.set(entry)
    // acknowledge all lichess tabs to re-render(altering the css)
    browser.tabs.query({url: sites}, tabs => {
        for (let tab of tabs) {
            console.debug(`sending message to tab: ${tab.id}`)
            browser.tabs.sendMessage(tab.id, {color: color, piece: piece, url: url})
        }
    })
}
