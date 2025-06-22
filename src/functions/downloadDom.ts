import { toPng } from "html-to-image";
import { saveAs as saveFileAs } from "file-saver";

// NOTE: Firefox does not support this library, or any similar library, due to privacy concerns.
const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

/**\
 * Downloads elements from the DOM.
 * @param {React.RefObject<T extends HTMLElement>} ref useRef pointer to the parent element.
 * @param {string} fileName (optional) name of the file to be downloaded.
 */
async function downloadDom<T extends HTMLElement | null>(
  ref: React.RefObject<T>,
  fileName?: string,
) {
  if (!ref.current) return;

  if (isFirefox) {
    window.alert("הורדת תמונה לא עובדת בדפדפן זה. אנא השתמשו בכרום");
    return;
  }

  // Wait for fonts to load, just in case
  if (document.fonts) await document.fonts.ready;

  const imageData = await toPng(ref.current);
  const blob = await (await fetch(imageData)).blob();
  saveFileAs(blob, fileName || "bus-arrangements" + ".png");
}

export default downloadDom;
