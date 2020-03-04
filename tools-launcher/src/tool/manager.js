import ToolLoader from "./loader.js";
import ToolsCommunicationApi from "./api/tools.js";
import ToolCommunicationClient from "./api/client.js";
import ToolMessage from "./api/message.js";
import ToolFrameManager from "./frame-manager/choose.js";

export default class ToolManager {
    constructor() {
        this.loader = new ToolLoader;
        this.running = {};
        window.running = this.running;
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
        const tools = await fetch('/tools/tools.json').then(e => e.json());
        for (const toolName in tools) {
            let tool = null;
            const toolPath = tools[toolName];
            try {
                
                tool = await fetch(toolPath + 'tool.config.json').then(e => e.json());
            } catch (e) {
                console.log(e);
                continue;
            }
            tool.basePath = toolPath;
            if (tool.offlineScript) {
                
                this.offlineClasses[tool.name] = toolPath + tool.offlineScript;
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

        let src = tool.htmlMain;
        if (window.DEV_MODE) {
            src = tool.basePath + src;
        }

        const toolFrame = new ToolFrameManager(src);
        toolFrame.setId(name);
        toolFrame.setIcon(tool.icon);
        toolFrame.open().then((frame) => {
            running[name] = frame;
            this.addListeners(frame, name);
        }).catch(e => {
            running[name] = undefined;
            delete running[name];
        });
    }

    closeAll() {
        for (const toolName of Object.keys(this.running)) {
            this.running[toolName].close();
        }
    }

    getTotalRunning() {
        return Object.keys(this.running).length;
    }

    addListeners(frame, name) {
        const running = this.running;
        const clientObject = this.clientObject;
        const toolsApi = this.api;
        const offlineInstances = this.offlineClasses;

        // inject stuff here
        frame.on('loaded', async function(frame, loadSuccess) {
            if (loadSuccess) {
                const window = frame.getWindow();
                window.opener = null;
                if (!window.ToolsApi) {
                    window.ToolsApi = clientObject;
                    Object.preventExtensions(window.ToolsApi);
                    Object.freeze(window.ToolsApi);
                }
    
                if (window.location.href.startsWith("chrome")) {
                    for (const toolName in offlineInstances) {
                        window[toolName] = (await window.eval(`import("${offlineInstances[toolName]}")`)).default;
                    }
                } else {
                    for (const toolName in offlineInstances) {
                        window[toolName] = (await import(offlineInstances[toolName])).default;
                        
                    }                      
                }
                window.dispatchEvent(new CustomEvent('INJECTION_DONE'));
            } else {
                console.log('Loading failed.');
            }

        });

        frame.on('loaded', function() {
            // it failed
            const window = frame.getWindow();
            if (window.location.origin === "null") {
                frame.close();
                alert("Failed to load " + name);
            }
        });

        frame.on("close", function () {
            running[name] = undefined;
            delete running[name];
        });
    }
}