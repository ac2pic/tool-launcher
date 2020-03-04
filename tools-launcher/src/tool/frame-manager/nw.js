import BaseToolFrameManager from "./base.js";

export default class NwJsToolFrameManager extends BaseToolFrameManager {

    async open() {
        const config = {
            id: this.id,
            icon: this.icon
        };
        return new Promise((resolve, reject) => {
            nw.Window.open(this.src, config, (nwWindow) => {
                this.set(nwWindow);
                this.addNwListeners();
                resolve(this);
            });
        });
    }
    
    addNwListeners() {
        const frame = this.get();
        let alreadyLoaded = false;
        const window = this.getWindow();
        window.addEventListener('load', () => {
            // if it failed
            if (!alreadyLoaded) {
                alreadyLoaded = true;
                this.onLoaded(frame, window.location.origin !== "null");
            }
        });

        frame.on('loaded', () => {
            // if it successed
            if (!alreadyLoaded) {
                alreadyLoaded = true;
                this.onLoaded(frame, window.location.origin !== "null");
            }
        });

        frame.on('closed', () => {
            this.onClose(frame);
        });
    }

    close() {
        this.get().close(true);
    }
}