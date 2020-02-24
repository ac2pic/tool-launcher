export default class ToolConfig {
    constructor() {
        this.name = "";
        this.config = {};
    }

    load(config) {
        this.name = config.name;
        
        if (config.icon) {
            this.config.icon = config.icon;
        }

        if (config.devMain) {
            this.config.devMain = config.devMain;
        } 
        
        if (config.htmlMain) {
            this.config.htmlMain = config.htmlMain;
        }

        if (config.offlineScript) {
            this.config.offlineScript = config.offlineScript;
        }
    }

    get(key) {
        if (key === 'name') {
            return this.name;
        }
        
        return this.config[key];
    }

}