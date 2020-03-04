import {isNw} from "../../platform-check.js";

import NwJsToolFrameManager from "./nw.js";
import BrowserToolFrameManager from "./browser.js";

let choiceClass = null;
if (isNw) {
    choiceClass = NwJsToolFrameManager;
} else {
    choiceClass = BrowserToolFrameManager;
}

export default choiceClass;