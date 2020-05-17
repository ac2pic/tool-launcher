import BaseToolFrameManager from "./base.js";

export default class BrowserToolFrameManager extends BaseToolFrameManager {


    async open() {

        const frame = window.open(this.getTool().src, this.tool.name + "-window", "width=800,height=800");

        this.set(frame);
        this.addBrowserListeners();
        return this;
    }

    _addBrowserUnloadListener(func) {
        this.getWindow().addEventListener('beforeunload', func);
    }

    addBrowserListeners() {
        const frame = this.get();
        let didReload;

        const unloadListener = () => {
            didReload = Symbol('DID_RELOAD');
            this.getWindow()[didReload] = true;
            reloadId = setTimeout(checkReload);
        }

        let reloadId = -1;
        let checkReload = () => {
            reloadId = setTimeout(checkReload);
            const toolWindow = this.getWindow();
            if (!toolWindow[didReload]) {
                console.log('Reloaded');
                timeoutId = -1;
                timeoutId = setTimeout(checker);
                clearTimeout(reloadId);
            } else if (toolWindow.closed) {
                console.log('It closed');
                this.onClose(this);
                clearTimeout(reloadId);
            }
        };

        let timeoutId = -1;

        const checker = () => {
            timeoutId = setTimeout(checker);
            const toolWindow = this.getWindow();
            if (toolWindow.document.readyState === "complete") {
                if (toolWindow.location.href !== "about:blank") {
                    clearTimeout(timeoutId);
                    if (toolWindow.location.origin === "null") {
                        this.onLoaded(this, false);
                    } else {
                        this._addBrowserUnloadListener(unloadListener);
                        this.onLoaded(this, true);
                    }
                }
            } else {
                console.log(toolWindow.document.readyState)
            }


        };
        timeoutId = setTimeout(checker);
    }

    close() {
        if (this.running) {
            this.running = false;
            this.get().close();
        }
    }
}