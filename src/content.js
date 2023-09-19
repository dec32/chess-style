const browser = window.browser ? window.browser : chrome

console.debug(`Calling background.js.`)
browser.runtime.sendMessage({tab: true})
    .then(resp => console.debug(`Response from background.js: ${resp}`))