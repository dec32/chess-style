import storage from "./storage.js"

const themes = ["gray", "blue", "green", "red", "black"]
var cur = 0

storage.getTheme().then(theme => {
    if (!theme) {
        return
    }
    for (let i = 0; i < themes.length; i++) {
        if (theme == themes[i]) {
            cur = i
            apply(theme)
            return
        }
    }
    console.warn(`theme ${theme} not found`)
    cur = 0
})

document.querySelector(".heading").onclick = e => {
    cur = (cur + 1) % themes.length
    apply(themes[cur])
}

function apply(theme) {
    let root = document.querySelector(':root').style
    root.setProperty("--theme", `var(--${theme})`)
    if (["gray", "black"].includes(theme)) {
        root.setProperty("--theme-non-gray", "var(--blue)")
    } else {
        root.setProperty("--theme-non-gray", `var(--${theme})`)
    }
    storage.setTheme(theme)

    // heading text
    // todo: implement in css or use some smater way
    let heading = document.querySelector(".heading").style
    if (theme == "gray") {
        heading.color = "black";
    } else {
        heading.color = "white";
    }
}