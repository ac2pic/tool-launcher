import ToolLoader from "./loader.js";
import ToolsCommunicationApi from "./api/tools.js";
import ToolCommunicationClient from "./api/client.js";
import ToolMessage from "./api/message.js";

export default class ToolManager {
    constructor() {
        this.loader = new ToolLoader;
        this.running = {};
        this.api = new ToolsCommunicationApi;
        this.offlineClasses = {};
        ToolCommunicationClient.comApi = this.api;
        Object.freeze(this.api);
        this.clientObject = {
            Communication: {
                Client: ToolCommunicationClient,
                Message: ToolMessage,
                Api: this.api
            }
        };

        Object.freeze(this.clientObject.Communication);

    }

    async loadTools() {
        const toolsPath = require('path').join(nw.App.startPath, 'tools/');
        const tools = this.loader.loadTools(toolsPath, '/tools/');

        for (const tool of tools) {
            if (tool.offlineScript) {
                this.offlineClasses[tool.name] = tool.offlineScript;
            }

            this._createToolButton(tool);
        }

    }


    _createToolButton(tool) {
        const name = tool.name;
        const button = template.cloneNode();
        button.innerText = name;
        
        button.onclick = () => {
            this.startTool(tool);
        };

        buttonList.appendChild(button);
    }

    startTool(tool) {
        const running = this.running;
        
        const name = tool.name;
        if (running[name]) {
            throw Error(`"${name}" is already running.`);
        }

        running[name] = true;
        const config = {};
        
        config.id = name;
        config.icon = tool.icon;
        const callback = this._newWindowGenerator(name);
        try {
            nw.Window.open(tool.htmlMain, config, callback);
        } catch (e) {
            running[name] = undefined;
            delete running[name];
        }
        
    }

    closeAll() {
        for (const toolName of Object.keys(this.running)) {
            this.running[toolName].close(true);
        }
    }

    getTotalRunning() {
        return Object.keys(this.running).length;
    }

    _newWindowGenerator(name) {
        const running = this.running;
        const clientObject = this.clientObject;
        const offlineInstances = this.offlineClasses;
        return (new_win) => {
            running[name] = new_win;

            // inject stuff here
            new_win.on('document-start', function(window) {
                window.opener = null;
                window.ToolsApi = clientObject;
                window.importOfflineScripts = async () => {
                    const offlineScripts = {};
                    if (window.location.href.startsWith("chrome")) {
                        for (const toolName in offlineInstances) {
                            offlineScripts[toolName] = (await window.eval(`import("${offlineInstances[toolName]}")`)).default;
                        }
                    } else {
                        for (const toolName in offlineInstances) {
                            offlineScripts[toolName] = (await import(offlineInstances[toolName])).default;
                        }                      
                    }

                    return offlineScripts;
                }
                Object.preventExtensions(window.ToolsApi);
                Object.freeze(window.ToolsApi);
            });

            new_win.on('close', function() {
                new_win.close(true);
            });

            new_win.on("closed", function () {
                running[name] = undefined;
                delete running[name];
             });
        }
    }
}