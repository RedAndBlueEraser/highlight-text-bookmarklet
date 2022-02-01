/*
 * format-text-bookmarklet.js
 * Version 20220202
 * Written by Harry Wong (RedAndBlueEraser)
 */

(() => {
  const getTextNodes = node => {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        return [node];
      case Node.ELEMENT_NODE:
      case Node.DOCUMENT_NODE:
      case Node.DOCUMENT_FRAGMENT_NODE:
        return Array.prototype.map.call(node.childNodes, childNode => getTextNodes(childNode)).flat();
      default:
        return [];
    }
  };

  const getNextClosestTextNode = (node, startOffset = 0) => {
    switch (node.nodeType) {
      case Node.TEXT_NODE: {
        if (startOffset < node.length) {
          return node;
        }
        let nextClosestNode = null;
        while (!(nextClosestNode = node.nextSibling) && (node = node.parentNode));
        return nextClosestNode ? getNextClosestTextNode(nextClosestNode) : null;
      }
      case Node.ELEMENT_NODE:
      case Node.DOCUMENT_NODE:
      case Node.DOCUMENT_FRAGMENT_NODE: {
        const childNodes = node.childNodes;
        const length = childNodes.length;
        for (let i = startOffset; i < length; i++) {
          const textNode = getNextClosestTextNode(childNodes[i]);
          if (textNode) {
            return textNode;
          }
        }
        let nextClosestNode = null;
        while (!(nextClosestNode = node.nextSibling) && (node = node.parentNode));
        return nextClosestNode ? getNextClosestTextNode(nextClosestNode) : null;
      }
      default: {
        let nextClosestNode = null;
        while (!(nextClosestNode = node.nextSibling) && (node = node.parentNode));
        return nextClosestNode ? getNextClosestTextNode(nextClosestNode) : null;
      }
    }
  };

  const getPreviousClosestTextNode = (node, endOffset = node.length || node.childNodes.length) => {
    switch (node.nodeType) {
      case Node.TEXT_NODE: {
        if (endOffset > 0 && node.length > 0) {
          return node;
        }
        let previousClosestNode = null;
        while (!(previousClosestNode = node.previousSibling) && (node = node.parentNode));
        return previousClosestNode ? getPreviousClosestTextNode(previousClosestNode) : null;
      }
      case Node.ELEMENT_NODE:
      case Node.DOCUMENT_NODE:
      case Node.DOCUMENT_FRAGMENT_NODE: {
        const childNodes = node.childNodes;
        for (let i = endOffset; i-- > 0; ) {
          const textNode = getPreviousClosestTextNode(childNodes[i]);
          if (textNode) {
            return textNode;
          }
        }
        let previousClosestNode = null;
        while (!(previousClosestNode = node.previousSibling) && (node = node.parentNode));
        return previousClosestNode ? getPreviousClosestTextNode(previousClosestNode) : null;
      }
      default: {
        let previousClosestNode = null;
        while (!(previousClosestNode = node.previousSibling) && (node = node.parentNode));
        return previousClosestNode ? getPreviousClosestTextNode(previousClosestNode) : null;
      }
    }
  };

  const splitContents = range => {
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;
    switch (startContainer.nodeType) {
      case Node.TEXT_NODE:
        if (startOffset > 0) {
          range.setStart(startContainer.splitText(startOffset), 0);
        }
        break;
      case Node.ELEMENT_NODE:
        range.setStart(getNextClosestTextNode(startContainer, startOffset), 0);
        break;
      default:
        break;
    }

    const endContainer = range.endContainer;
    const endOffset = range.endOffset;
    switch (endContainer.nodeType) {
      case Node.TEXT_NODE:
        if (endOffset < endContainer.length) {
          endContainer.splitText(endOffset);
        }
        break;
      case Node.ELEMENT_NODE:
        const textNode = getPreviousClosestTextNode(endContainer, endOffset);
        range.setEnd(textNode, textNode.length);
        break;
      default:
        break;
    }
  };

  const createFormattedTextElement = (textNode, style) => {
    const formattedTextElement = document.createElement("formatted-text");
    Object.assign(formattedTextElement.style, style);
    textNode.parentNode.replaceChild(formattedTextElement, textNode);
    formattedTextElement.appendChild(textNode);
    return formattedTextElement;
  };

  const formatRange = (range, style) => {
    splitContents(range);

    const commonAncestorContainer = range.commonAncestorContainer;
    switch (commonAncestorContainer.nodeType) {
      case Node.TEXT_NODE:
        createFormattedTextElement(commonAncestorContainer, style);
        break;
      case Node.ELEMENT_NODE:
        const textNodes = getTextNodes(commonAncestorContainer);
        const textNodesEndOffset = textNodes.lastIndexOf(range.endContainer);
        for (let i = textNodes.indexOf(range.startContainer); i <= textNodesEndOffset; i++) {
          createFormattedTextElement(textNodes[i], style);
        }
        break;
      default:
        break;
    }
  };

  const getSelections = (frame = window) => {
    try {
      const selection = frame.getSelection();
      return selection && selection.rangeCount > 0 ?
        [selection, ...Array.prototype.flatMap.call(frame.frames, frame => getSelections(frame))] :
        Array.prototype.flatMap.call(frame.frames, frame => getSelections(frame));
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const formatSelections = style => {
    for (const selection of getSelections()) {
      const selectionRangeCount = selection.rangeCount;
      for (let i = 0; i < selectionRangeCount; i++) {
        try {
          formatRange(selection.getRangeAt(i), style);
        } catch (error) {
          console.error(error);
        }
      }
      selection.removeAllRanges();
    }
  };

  const createFormatUIIframeElement = () => {
    const iframeElement = document.createElement("iframe");
    document.body.appendChild(iframeElement);
    const iframeDocument = iframeElement.contentDocument;
    iframeDocument.open();
    iframeDocument.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        </head>
        <body>
          <main>
            <button class="text-format-picker-item text-format-picker-item-bold" title="Bold" aria-label="Bold" data-text-format-picker-value="font-weight=bold"><span aria-hidden="true">B</span></button>
            <button class="text-format-picker-item text-format-picker-item-italic" title="Italic" aria-label="Italic" data-text-format-picker-value="font-style=italic"><span aria-hidden="true">I</span></button>
            <button class="text-format-picker-item text-format-picker-item-underline" title="Underline" aria-label="Underline" data-text-format-picker-value="text-decoration=underline"><span aria-hidden="true">U</span></button>
            <button class="text-format-picker-item text-format-picker-item-strikethrough" title="Strikethrough" aria-label="Strikethrough" data-text-format-picker-value="text-decoration=line-through"><span aria-hidden="true">ab</span></button>

            <button class="text-format-picker-item text-format-picker-item-color text-format-picker-item-color-black" title="Black" aria-label="Black" data-text-format-picker-value="background-color=black"></button>
            <button class="text-format-picker-item text-format-picker-item-color text-format-picker-item-color-gray" title="Gray" aria-label="Gray" data-text-format-picker-value="background-color=gray"></button>
            <button class="text-format-picker-item text-format-picker-item-color text-format-picker-item-color-silver" title="Silver" aria-label="Silver" data-text-format-picker-value="background-color=silver"></button>
            <button class="text-format-picker-item text-format-picker-item-color text-format-picker-item-color-white" title="White" aria-label="White" data-text-format-picker-value="background-color=white"></button>

            <button class="text-format-picker-item text-format-picker-item-color" title="Maroon" aria-label="Maroon" data-text-format-picker-value="background-color=maroon"></button>
            <button class="text-format-picker-item text-format-picker-item-color" title="Red" aria-label="Red" data-text-format-picker-value="background-color=red"></button>
            <button class="text-format-picker-item text-format-picker-item-color" title="Orange" aria-label="Orange" data-text-format-picker-value="background-color=orange"></button>
            <button class="text-format-picker-item text-format-picker-item-color" title="Yellow" aria-label="Yellow" data-text-format-picker-value="background-color=yellow"></button>
            <button class="text-format-picker-item text-format-picker-item-color" title="Lime" aria-label="Lime" data-text-format-picker-value="background-color=lime"></button>
            <button class="text-format-picker-item text-format-picker-item-color" title="Aqua" aria-label="Aqua" data-text-format-picker-value="background-color=aqua"></button>
            <button class="text-format-picker-item text-format-picker-item-color" title="Blue" aria-label="Blue" data-text-format-picker-value="background-color=blue"></button>
            <button class="text-format-picker-item text-format-picker-item-color" title="Navy" aria-label="Navy" data-text-format-picker-value="background-color=navy"></button>
            <button class="text-format-picker-item text-format-picker-item-color" title="Purple" aria-label="Purple" data-text-format-picker-value="background-color=purple"></button>
            <button class="text-format-picker-item text-format-picker-item-color" title="Fuchsia" aria-label="Fuchsia" data-text-format-picker-value="background-color=fuchsia"></button>

            <input class="text-format-picker-item text-format-picker-item-color-picker" type="color" value="#ffff00" title="Color picker" aria-label="Color picker">

            <button class="text-format-picker-item text-format-picker-item-cancel" title="Cancel" aria-label="Cancel">Cancel</button>
          </main>
        </body>
      </html>
    `);
    iframeDocument.close();

    let cssStyleSheet = null;
    return new Promise((resolve, reject) => {
      if (document.readyState === "interactive" || document.readyState === "complete") {
        resolve();
      } else {
        iframeElement.addEventListener("load", resolve, { once: true });
        iframeElement.addEventListener("error", reject, { once: true });
      }
    })
    .then(
      () => new Promise((resolve, reject) => {
        const styleElement = iframeDocument.head.appendChild(iframeDocument.createElement("style"));
        const styleElementSheet = styleElement.sheet;
        if (styleElementSheet && styleElementSheet.cssRules) {
          cssStyleSheet = styleElementSheet;
          resolve();
        } else {
          styleElement.remove();
          reject();
        }
      })
      .catch(
        () => new Promise((resolve, reject) => {
          let linkElement = null;
          for (const styleSheet of document.styleSheets) {
            try {
              if (styleSheet.cssRules) {
                linkElement = styleSheet.ownerNode;
                break;
              }
            } catch (error) {
              console.error(error);
            }
          }
          if (linkElement) {
            linkElement = linkElement.cloneNode(true);
            linkElement.addEventListener("load", () => { resolve(linkElement); }, { once: true });
            linkElement.addEventListener("error", reject, { once: true });
            iframeDocument.head.appendChild(linkElement);
          } else {
            reject();
          }
        })
        .then(linkElement => {
          cssStyleSheet = linkElement.sheet;
        })
      )
    )
    .then(() => {
      for (let i = cssStyleSheet.cssRules.length; i-- > 0; ) {
        cssStyleSheet.deleteRule(i);
      }
      const cssRules = [
        `* {
          box-sizing: border-box;
        }`,
        `html {
          font-size: 12px;
        }`,
        `body {
          display: inline-block;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
          font-size: 1rem;
          line-height: 1.5;
          margin: 0;
          -webkit-tap-highlight-color: rgba(0,0,0,0);
          -webkit-text-size-adjust: 100%;
        }`,
        `button, input {
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          margin: 0;
        }`,
        `button {
          -webkit-appearance: button;
          border-radius: 0;
          text-transform: none;
        }`,
        `button:focus:not(:focus-visible) {
          outline: 0;
        }`,
        `::-moz-focus-inner {
          border-style: none;
          padding: 0;
        }`,
        `main {
          background: padding-box #fff;
          border: 1px solid rgba(0,0,0,.15);
          border-radius: .25rem;
          color: #212529;
          display: inline-grid;
          gap: .5rem 2px;
          grid: [font-style grayscale] 2rem [color] 2rem [cancel] 2rem / repeat(12, 2rem);
          padding: .5rem;
        }`,
        `@media (prefers-color-scheme: dark) {
          main {
            background-color: #343a40;
            color: #dee2e6;
          }
        }`,
        `.text-format-picker-item {
          background-color: #fff;
          border: 1px solid #dee2e6;
          border-radius: 1px;
          padding: 0;
          position: relative;
          text-align: center;
          transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
          vertical-align: middle;
        }`,
        `@media (prefers-reduced-motion: reduce) {
          .text-format-picker-item {
            transition: none;
          }
        }`,
        `.text-format-picker-item:focus {
          border-color: #ffc107;
          box-shadow: 0 0 0 .25rem rgba(255,193,7,.5);
          outline: 0;
          z-index: 1;
        }`,
        `.text-format-picker-item:hover {
          border-color: #ffc107;
        }`,
        `.text-format-picker-item-bold,
        .text-format-picker-item-italic,
        .text-format-picker-item-underline,
        .text-format-picker-item-strikethrough {
          font-family: Verdana, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
          grid-row-start: font-style;
        }`,
        `.text-format-picker-item-bold,
        .text-format-picker-item-italic,
        .text-format-picker-item-underline {
          font-size: 1.166667rem;
        }`,
        `.text-format-picker-item-bold {
          font-weight: bold;
        }`,
        `.text-format-picker-item-italic {
          font-style: italic;
        }`,
        `.text-format-picker-item-underline {
          text-decoration: underline;
        }`,
        `.text-format-picker-item-strikethrough {
          text-decoration: line-through;
        }`,
        `.text-format-picker-item-color {
          grid-row: color;
        }`,
        `.text-format-picker-item-color-black,
        .text-format-picker-item-color-gray,
        .text-format-picker-item-color-silver,
        .text-format-picker-item-color-white {
          grid-row: grayscale;
        }`,
        `.text-format-picker-item-color-black {
          grid-column: 6;
        }`,
        `.text-format-picker-item-color-gray {
          grid-column: 7;
        }`,
        `.text-format-picker-item-color-silver {
          grid-column: 8;
        }`,
        `.text-format-picker-item-color-white {
          grid-column: 9;
        }`,
        `.text-format-picker-item-color-picker {
          grid-area: color / auto / auto / span 2;
          height: 100%;
          padding: .25rem .5rem;
          width: 100%;
        }`,
        `.text-format-picker-item-color-picker::-moz-color-swatch {
          border-radius: 1px;
        }`,
        `.text-format-picker-item-color-picker::-webkit-color-swatch {
          border-radius: 1px;
        }`,
        `.text-format-picker-item-color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }`,
        `.text-format-picker-item-cancel {
          color: #212529;
          grid-area: cancel / auto / auto / span 12;
        }`
      ];
      for (const cssRule of cssRules.reverse()) {
        try {
          cssStyleSheet.insertRule(cssRule);
        } catch (error) {
          console.error(error);
        }
      }

      const { offsetHeight: iframeHeight, offsetWidth: iframeWidth } = iframeDocument.body;
      const iframeElementStyle = iframeElement.style;
      iframeElementStyle.border = "0";
      iframeElementStyle.height = iframeHeight + "px";
      iframeElementStyle.opacity = "1";
      iframeElementStyle.position = "fixed";
      const prefersReducedMotionReduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      iframeElementStyle.transition = prefersReducedMotionReduce ? "none" : "opacity 500ms";
      iframeElementStyle.width = iframeWidth + "px";
      iframeElementStyle.zIndex = "9999";

      let selectionFirstRect;
      try {
        selectionFirstRect = getSelection().getRangeAt(0).getBoundingClientRect();
      } catch (error) {
        console.error(error);
        selectionFirstRect = { bottom: 0, left: 0, right: 0, top: 0 };
      }
      iframeElementStyle.left = selectionFirstRect.right + "px";
      iframeElementStyle.top = selectionFirstRect.bottom + "px";
      let iframeRect = iframeElement.getBoundingClientRect();
      if (iframeRect.bottom > window.innerHeight) {
        iframeElementStyle.top = (selectionFirstRect.top - iframeHeight) + "px";
      }
      if (iframeRect.right > window.innerWidth) {
        iframeElementStyle.left = (selectionFirstRect.left - iframeWidth) + "px";
      }
      iframeRect = iframeElement.getBoundingClientRect();
      if (iframeRect.left < 0 || iframeRect.top < 0) {
        iframeElementStyle.left = iframeElementStyle.top = "0px";
      }

      let timeoutHandle = setTimeout(
        prefersReducedMotionReduce ?
        () => {
          iframeElement.remove();
        } :
        () => {
          iframeElementStyle.opacity = "0";
          setTimeout(() => {
            iframeElement.remove();
          }, 500);
        },
        10000);

      document.addEventListener("scroll", () => {
        iframeElement.remove();
      }, { once: true });

      document.addEventListener("selectionchange", () => {
        iframeElement.remove();
      }, { once: true });

      for (const textFormatPickerItemColor of iframeDocument.getElementsByClassName("text-format-picker-item-color")) {
        const textFormatPickerValueKeyValuePairs = {};
        for (const keyValuePair of textFormatPickerItemColor.getAttribute("data-text-format-picker-value").trim().split(/\s*&\s*/g)) {
          const { 0: key, 1: value } = keyValuePair.split(/\s*=\s*/g);
          textFormatPickerValueKeyValuePairs[key] = value;
        }
        textFormatPickerItemColor.style.backgroundColor = textFormatPickerValueKeyValuePairs["background-color"];
        textFormatPickerItemColor.addEventListener("click", () => {
          formatSelections(textFormatPickerValueKeyValuePairs);
          iframeElement.remove();
        }, { once: true });
      }

      for (const textFormatPickerItem of iframeDocument.querySelectorAll(".text-format-picker-item-bold, .text-format-picker-item-italic, .text-format-picker-item-underline, .text-format-picker-item-strikethrough")) {
        const textFormatPickerValueKeyValuePairs = {};
        for (const keyValuePair of textFormatPickerItem.getAttribute("data-text-format-picker-value").trim().split(/\s*&\s*/g)) {
          const { 0: key, 1: value } = keyValuePair.split(/\s*=\s*/g);
          textFormatPickerValueKeyValuePairs[key] = value;
        }
        textFormatPickerItem.addEventListener("click", () => {
          formatSelections(textFormatPickerValueKeyValuePairs);
          iframeElement.remove();
        }, { once: true });
      }

      const textFormatPickerItemColorPicker = iframeDocument.getElementsByClassName("text-format-picker-item-color-picker")[0];
      textFormatPickerItemColorPicker.addEventListener("click", () => {
        clearTimeout(timeoutHandle);
      }, { once: true });
      textFormatPickerItemColorPicker.addEventListener("change", () => {
        formatSelections({ backgroundColor: textFormatPickerItemColorPicker.value });
        iframeElement.remove();
      }, { once: true });

      iframeDocument.getElementsByClassName("text-format-picker-item-cancel")[0].addEventListener("click", () => {
        iframeElement.remove();
      }, { once: true });

      iframeElement.focus();

      return iframeElement;
    },
    () => {
      iframeElement.remove();
      formatSelections({ backgroundColor: "yellow" });
    });
  };

  createFormatUIIframeElement();
})();
