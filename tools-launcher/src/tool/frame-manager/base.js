export default class BaseToolFrameManager {
    constructor(tool) {
        this.tool = tool;
        this.frame = null;
        this.running = false;
        this.callbacks = {
            close: [],
            loaded: []
        };
    }
    
    getTool() {
        return this.tool;
    }

    on(type, cb) {
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push(cb);
    }

    callCbs(type, args) {
        if (this.callbacks[type]) {
            this.callbacks[type].forEach(cb => cb(...args));
        }
    }

    onClose(...args) {
       this.callCbs('close', args);
    }

    onLoaded(...args) {
        this.callCbs('loaded', args);
    }



    async open() {}


    close() {}   

    getWindow() {
        return this.get().window;
    }

    set(frame) {
        this.frame = frame;
    }

    get() {
        return this.frame;
    }
}