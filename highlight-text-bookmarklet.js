/*
 * highlight-text-bookmarklet.js
 * Version 20210613
 * Written by Harry Wong (RedAndBlueEraser)
 */

(() => {
  const DEFAULT_BACKGROUND_COLOR = "";

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

  const createMarkElement = (textNode, backgroundColor) => {
    const markElement = document.createElement("mark");
    markElement.style.backgroundColor = backgroundColor;
    textNode.parentNode.replaceChild(markElement, textNode);
    markElement.appendChild(textNode);
    return markElement;
  };

  const highlightRange = (range, backgroundColor) => {
    splitContents(range);

    const commonAncestorContainer = range.commonAncestorContainer;
    switch (commonAncestorContainer.nodeType) {
      case Node.TEXT_NODE:
        createMarkElement(commonAncestorContainer, backgroundColor);
        break;
      case Node.ELEMENT_NODE:
        const textNodes = getTextNodes(commonAncestorContainer);
        const textNodesEndOffset = textNodes.lastIndexOf(range.endContainer);
        for (let i = textNodes.indexOf(range.startContainer); i <= textNodesEndOffset; i++) {
          createMarkElement(textNodes[i], backgroundColor);
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

  const highlightSelections = backgroundColor => {
    for (const selection of getSelections()) {
      const selectionRangeCount = selection.rangeCount;
      for (let i = 0; i < selectionRangeCount; i++) {
        try {
          highlightRange(selection.getRangeAt(i), backgroundColor);
        } catch (error) {
          console.error(error);
        }
      }
      selection.removeAllRanges();
    }
  };

  highlightSelections(DEFAULT_BACKGROUND_COLOR);
})();
