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
        let alreadyLoaded = false;
        const repeatedListeners = () => {
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
        };
        repeatedListeners();

        const frame = this.get();

        frame.on('loaded', () => {
            // if it succeeded
            if (!alreadyLoaded) {
                alreadyLoaded = true;
                repeatedListeners();
                this.onLoaded(this, window.location.origin !== "null");
            }
        });

        frame.on('closed', () => {
            this.onClose(this);
        });
    }

    close() {
        if (this.running) {
            this.running = false;
            this.get().close(true);
        }
    }
}