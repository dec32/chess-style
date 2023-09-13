# Chess Style

Chess Style is a Firefox/Chrome extension that allows you to customize your piece set on lichess.org and chess.com.

## Release

- [Firefox Add-on](https://addons.mozilla.org/firefox/addon/chess-style/)

To install for Chrome, please see: [Install For Chrome](#install-for-chrome)

## Detail

|Popup|Lichess|Chess|
|:----:|:----:|:----:|
|![](https://github.com/dec32/Image-Storage/blob/master/chess-style/screenshot-1.png)|![](https://github.com/dec32/Image-Storage/blob/master/chess-style/screenshot-2.png)|![](https://github.com/dec32/Image-Storage/blob/master/chess-style/screenshot-3.png)|

The extension enables users to customize their piece sets sets through:

1. Filling in URLs;
2. Uploading image files;
3. Uploading a folder of images (the add-on will read the names of the images and automatically assign them to their correspond pieces).

When uploading a folder. The file name of an image must contain both the color and piece type. One-letter abbreviations are allowed but when using abbreviations for both color and piece type, they should be written as one word. Words are split by space( ), underscore(_), short dash(-) or dot(.). Take white knight for example, the followings are all legal names:
- `white knight.svg` (recommended);
- `white-knight-256px.png`;
- `w_knight.bmp`;
- `white.n.jiff`;
- `wn_with_shadow.webp`;

The support for chess.com is not fully accomplished, that is to say, the customization won't apply to the homepage.

## Install For Chrome

[Chrome Extension (version 0.2)](https://github.com/dec32/chess-style/releases/tag/v0.2/chess-style-for-chrome.zip)

1. Download the zip file from the link above and unzip it;
2. Go to chrome://extensions/, toggle on developer mode;
3. Click "Load unpacked extension" and select the unzipped folder.

Things would be a lot easier if Google didn't charge me 5 bucks for a developer account.

## Themes

- [John Pablok](https://github.com/dec32/chess-style/releases/download/v0.1/john-pablok.zip)
- [HD Pieces](https://github.com/dec32/chess-style/releases/download/v0.1/hd-pieces.zip)
