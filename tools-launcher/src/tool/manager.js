import ToolLoader from "./loader.js";
import ToolsCommunicationApi from "./api/tools.js";
import ToolCommunicationClient from "./api/client.js";
import ToolMessage from "./api/message.js";

export default class ToolManager {
    constructor() {
        this.loader = new ToolLoader;
        this.running = {};
        this.api = new ToolsCommunicationApi;
        ToolCommunicationClient.comApi = this.api;
        Object.freeze(this.api);
        this.clientObject = {
            Communication: {
                Client: ToolCommunicationClient,
                Message: ToolMessage
            }
        };

        Object.freeze(this.clientObject.Communication);

    }

    loadTools() {
        const toolsPath = require('path').join(nw.App.startPath, 'tools/');
        const tools = this.loader.loadTools(toolsPath, '/tools/');

        for (const tool of tools) {
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
        nw.Window.open(tool.htmlMain, config, callback);
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
        return function(new_win) {
            running[name] = new_win;
            
            // inject stuff here
            new_win.on('document-start', function(window) {
                window.opener = null;
                window.ToolsApi = clientObject;
                Object.preventExtensions(window.ToolsApi);
                Object.freeze(window.ToolsApi);
            });

            new_win.on('close', function() {
                
                running[name] = undefined;
                delete running[name];
                
                new_win.close(true);
            });
        }
    }
}