import ToolConfig from './config.js';
// const path = require('path');
export default class Tool {
    constructor(path) {
        this.path = path;
        this.config = new ToolConfig;
        this.devMode = false;
    }

    
    load(config) {
        this.config.load(config);
    }

    get name() {
        return this.config.get('name');
    }

    get src() {
        if (this.config.isDevMode()) {
            return this.config.get('devMain')
        }
        return this.path + this.config.get('htmlMain');
    }

    get offlineScriptSrc() {
        const offlineScript = this.config.get('offlineScript');
        if (offlineScript) {
            return this.path + offlineScript;
        }
        return '';
    }


    get icon() {
        const icon =  this.config.get('icon');
        
        if (icon) {
            return this.path + icon;
        }

        return '';
    }
}