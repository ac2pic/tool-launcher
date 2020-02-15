import ToolConfig from '../config.js';
const path = require('path');
export default class Tool {
    constructor(path) {
        this.path = path;
        this.config = new ToolConfig;
    }

    load(config) {
        this.config.load(config);
    }

    get name() {
        return this.config.get('name');
    }

    get htmlMain() {
        const devMain = this.config.get('devMain');
        if (window.DEV_MODE && devMain) {
            return devMain;
        }

        const htmlMain = this.config.get('htmlMain');
        return path.posix.join(this.path, htmlMain);
    }

    get icon() {
        const icon =  this.config.get('icon');
        if (icon) {
            return path.posix.join(this.path, icon);
        }

        return undefined;
        
    }
}