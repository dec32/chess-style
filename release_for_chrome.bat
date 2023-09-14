rmdir /s /q ..\chess-style-for-chrome
del ..\chess-style-for-chrome.zip
md ..\chess-style-for-chrome
xcopy res ..\chess-style-for-chrome\res /S /I
xcopy src ..\chess-style-for-chrome\src /S /I
copy manifest_chrome.json ..\chess-style-for-chrome\manifest.json

del ..\chess-style-for-chrome\src\browser.js
echo export default chrome >> ..\chess-style-for-chrome\src\browser.js
tar.exe -cf ..\chess-style-for-chrome.zip ..\chess-style-for-chrome
pause