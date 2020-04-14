import BaseToolFrameManager from "./base.js";

export default class BrowserToolFrameManager extends BaseToolFrameManager {


    async open() {

        const frame = window.open(this.getTool().src);

        this.set(frame);
        this.addBrowserListeners();
        return this;
    }

    addBrowserListeners() {
        const frame = this.get();
        const window = this.getWindow();
        let didReload;

        window.addEventListener('beforeunload', (event) => {
            didReload = Symbol('DID_RELOAD');
            window[didReload] = true;
            reloadId = setTimeout(checkReload);
        });

        let reloadId = -1;
        let checkReload = () => {
            reloadId = setTimeout(checkReload);
            if (!window[didReload]) {
                console.log('Reloaded');
                clearTimeout(reloadId);
            } else if (window.closed) {
                console.log('It closed');
                this.onClose(this);
                clearTimeout(reloadId);
            }
        };

        let timeoutId = -1;

        const checker = () => {
            timeoutId = setTimeout(checker);
            if (window.document.readyState === "complete") {
                if (window.location.href !== "about:blank") {
                    clearTimeout(timeoutId);
                    if (window.location.origin === "null") {
                        this.onLoaded(this, false);
                    } else {
                        this.onLoaded(this, true);
                    }
                }
            } else {
                console.log(window.document.readyState)
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