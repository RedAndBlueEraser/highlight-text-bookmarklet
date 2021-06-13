# Highlight Text and Format Text Bookmarklets
A bookmarklet to highlight selected text on a currently viewing webpage, and a bookmarklet to format selected text on a currently viewing webpage.

<img src="https://github.com/RedAndBlueEraser/highlight-text-bookmarklet/raw/master/demo.png" alt="Image of Highlight Text and Format Text bookmarklets" width="768">

## Synopsis
The `highlight-text-bookmarklet.js` bookmarklet (and its minified counterpart `highlight-text-bookmarklet.min.js`) highlights selected text on a currently viewing webpage. The selected text is wrapped in the `<mark>` HTML element. On most web browsers, the browser default CSS styling for the `<mark>` HTML element is a yellow coloured background on the element.

The `format-text-bookmarklet.js` bookmarklet (and its minified counterpart `format-text-bookmarklet.min.js`) allows the bolding, italicising, underlining, strikethrough, or highlighting (of any colour) selected text on a currently viewing webpage. The selected text is wrapped in the `<formatted-text>` custom HTML element with CSS rules attached.

## Browser Support
The bookmarklets should work on most web browsers.

The following desktop browsers were tested and support the bookmarklets.

    Edge 90+
    Firefox 72+
    Chrome 91+

## Installation
Unhide the web browser's bookmarks toolbar.

Drag either the `Highlight Text` and/or `Format Text` hyperlinks from [here](https://127.0.0.1) into the web browser's bookmarks toolbar.

## Usage

### Highlight Text
Select the text on a webpage to be highlighted, and then click on the `Highlight Text` bookmarklet. The selected text is highlighted and then deselected.

To change from the default highlight colour, edit the bookmarklet's JavaScript code. Towards the start of the code, change from `const DEFAULT_BACKGROUND_COLOR=""` to `const DEFAULT_BACKGROUND_COLOR="aqua"`. Replace `aqua` with a different colour of choice using [colour keywords](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#color_keywords) or other CSS colour notations (e.g. RGB hexadecimal).

### Format Text
Select the text on a webpage to be formatted, and then click on the `Format Text` bookmarklet. A floating menu appears presenting options to bold, italicise, underline, strikethrough, or highlight text in various colours. Click on a format option to format the selected text and deselect the text, or click on "Cancel" to remove the floating menu without formatting the selected text.

![Image of Format Text bookmarklet](https://github.com/RedAndBlueEraser/highlight-text-bookmarklet/raw/master/ui.png)

## Notes
- The Highlight Text bookmarklet uses the `<mark>` HTML element to highlight text. On most web browsers, the browser default CSS styling is a yellow coloured background on the element. However, web browsers are free to implement different browser default CSS styling rules for the `<mark>` element, and the Highlight Text bookmarklet will use those CSS styling rules. Furthermore, the webpage can define custom CSS styles to override the browser default styles for the `<mark>` element. The Format Text bookmarklet minimises the likelihood of this occurring by using the `<formatted-text>` custom HTML element instead.
- On Chromium based web browsers (Google Chrome and Microsoft Edge), using the Format Text bookmarklet with "Select All" on a webpage may not work. When clicking on a format option in the Format Text floating menu, the selected text is deselected and formatting is not applied. To work around this issue, use the keyboard tab/shift + tab keys to select a format option in the Format Text floating menu, instead of clicking with a mouse.
- Some webpages may have set Content Security Policy that prevents the Format Text bookmarklet from working. The Format Text bookmarklet has been written to bypass some of these security measures, but there are still certain situations where the Format Text bookmarklet will fail (e.g. only third-party style-src). In that case, the Format Text bookmarklet will fall back to highlighting the selected text with a yellow background.
- These bookmarklets cannot highlight and format text inside text boxes (e.g. `<input>` or `<textarea>`).
- The Format Text floating menu will switch between dark mode and light mode based on the system's colour scheme preference.

## Author
Harry Wong (RedAndBlueEraser)
