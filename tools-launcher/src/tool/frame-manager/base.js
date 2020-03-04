export default class BaseToolFrameManager {
    constructor(src) {
        this.src = src;
        this.frame = null;
        this.callbacks = {
            close: [],
            loaded: []
        };
    }
    
    set(frame) {
        this.frame = frame;
    }

    setIcon(iconPath) {
        this.icon = iconPath;
    }

    setId(name) {
        this.id = name;
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

    get() {
        return this.frame;
    }
}