const browser = window.browser ? window.browser : chrome
console.debug(`Sending message to background.js.`)
browser.runtime.sendMessage({tab: true}, console.debug)