import ToolLoader from "./loader.js";

export default class ToolManager {
    constructor() {
        this.loader = new ToolLoader;
        this.running = {};
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

    _newWindowGenerator(name) {
        const running = this.running;
        return function(new_win) {
            const childWindow = new_win.window;
            running[name] = childWindow;
            // inject stuff here
            new_win.on('document-start', function(window) {
                window.opener = null;
                running[name] = window;
                window.toolsApi = api;
            });
            new_win.on('close', function() {
                
                delete running[name];
                running[name] = undefined;
                new_win.close(true);
            });
        }
    }
}