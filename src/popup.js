import browser from "./browser.js"
import storage from "./storage.js"
import * as filename from "./filename.js"
import "./popup_style.js"

// url parameters
const params = new URLSearchParams(window.location.search)
const tab = params.get("tab")
const uploading = params.get("uploading")

// const storage = browser.storage.local
const firefox = navigator.userAgent.toLocaleLowerCase().includes("firefox")

// styling
if (tab) {
    document.querySelector(".heading").style.textAlign = "center"
}

// recover from storage and fill up the textfields
storage.forEachPieces(setTextfield)

// listen for url changes
document.querySelectorAll(".url-text-input").forEach(input => {
    input.addEventListener("input", e=> {
        let id = e.target.closest("tr").id.split("-")
        let color = id[0]
        let piece = id[1]
        let url = e.target.value
        apply(color, piece, url)
    })
})

// listen for uploads(single image)
document.querySelectorAll(".upload-btn").forEach(btn => {
    let input = btn.querySelector("input[type=file]")
    input.addEventListener("input", e => {
        let pieceNode = e.target.closest("tr")
        let id = pieceNode.id.split("-")
        let file = e.target.files[0]
        handleFile(file, {color: id[0], piece:id[1]})
    })
})

// listen for uploads(folder)
document.querySelector(".upload-set-btn").querySelector("input[type=file]").addEventListener("input", e => {
    for (let file of e.target.files) {
        handleFile(file)
    }
})

// listen for upload buttons(to trigger the file inputs)
document.querySelectorAll(".upload-btn, .upload-set-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        if (!firefox || tab) {
            btn.querySelector("input[type=file]").click()
        } else {
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

function setTextfield(color, piece, url) {
    let textfield = document.querySelector(`#${color}-${piece}`).querySelector("input[type=text]")
    if (url.length >= 64) {
        // to speedup pageload. filling big strings into textfileds is very slow.
        textfield.value = url.substring(0, 64)
        textfield.addEventListener("focus", e=>{e.target.value = url}, {once: true})
    } else {
        textfield.value = url
    }
}

function apply(color, piece, url) {
    browser.runtime.sendMessage({color: color, piece: piece, url: url})
}

function handleFile(file, id = null) {
    if (!file.type.startsWith("image")) {
        return
    }
    if (id == null) {
        id = filename.analyze(file.name)
    }
    if (id == null) {
        console.warn(`Can not recognize file ${file.name}.`)
        return
    }
    let reader = new FileReader()
    reader.addEventListener("load", () => {
        let url = reader.result
        setTextfield(id.color, id.piece, url)
        apply(id.color, id.piece, url)
    })
    reader.readAsDataURL(file);
}
