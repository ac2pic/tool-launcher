import BaseToolFrameManager from "./base.js";

export default class NwJsToolFrameManager extends BaseToolFrameManager {

    async open() {
        const tool = this.getTool();
        const config = {
            id: tool.id,
            icon: tool.icon
        };
        return new Promise((resolve, reject) => {
            nw.Window.open(tool.src, config, (nwWindow) => {
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
                this.onLoaded(this, window.location.origin !== "null");
            }
        });

        window.addEventListener('beforeunload', function() {
            alreadyLoaded = false;
        });
        frame.on('loaded', () => {
            // if it succeeded
            if (!alreadyLoaded) {
                alreadyLoaded = true;
                this.onLoaded(this, window.location.origin !== "null");
            }
        });

        frame.on('closed', () => {
            this.onClose(this);
        });
    }

    close() {
        this.get().close(true);
    }
}