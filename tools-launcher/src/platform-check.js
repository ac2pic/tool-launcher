let isNw = false;
if (window.nw && typeof window.require === "function") {
    isNw = require("nw.gui") === window.nw;
}

export {isNw};