// import ToolLoader from "./loader.js";
import ToolsCommunicationApi from "./api/tools.js";
import ToolCommunicationClient from "./api/client.js";
import ToolMessage from "./api/message.js";
import ToolFrameManager from "./frame-manager/choose.js";
import { isNw } from "../platform-check.js";
import Tool from "./model/tool.js";

export default class ToolManager {
    constructor() {
        // this.loader = new ToolLoader;
        this.frames = {};
        this.running = 0;
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
            let toolConfig = null;
            const toolPath = tools[toolName];
            let name = '';
            try {
                
                toolConfig = await fetch(toolPath + 'tool.config.json').then(e => e.json());
                name = toolConfig.name || '';
                if (!name) {
                    throw Error(`${toolPath} has no name associated with it.`);
                }

                if (this.frames[name]) {
                    throw Error(`Duplicate ${name} found at ${toolPath} `);
                }

            } catch (e) {
                console.log(e);
                continue;
            }


           
            const tool = new Tool(toolPath);
            tool.load(toolConfig);

            const offlineScriptSrc = tool.offlineScriptSrc; 
            if (offlineScriptSrc) {
                this.offlineClasses[name] = offlineScriptSrc;
            }
            const toolFrame = new ToolFrameManager(tool);

            this.frames[name] = toolFrame;
            



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
        const name = tool.name;
        const frame = this.frames[name];
        
        if (frame.running) {
            new Notification(`"${name}" is already running.`, {})
            return;
        }

        frame.running = true;
        this.running += 1;

        frame.open().then((frame) => {
            this.addListeners(frame, name);
        }).catch(e => {
            frame.running = false;
            this.running -= 1;
        });
    }

    closeAll() {
        for (const frameName of Object.keys(this.frames)) {
            const frame = this.frames[frameName];

            if (frame.running) {
                frame.close();
            }
        }
    }

    getTotalRunning() {
        return this.running;
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
                let baseUrl = '/assets/';
                if (window.location.href.startsWith("chrome")) {
                    for (const toolName in offlineInstances) {
                        window[toolName] = (await window.eval(`import("${offlineInstances[toolName]}")`)).default;
                    }
                } else {
                    for (const toolName in offlineInstances) {
                        window[toolName] = (await import(offlineInstances[toolName])).default;
                        baseUrl = 'http://localhost:4000' + baseUrl;
                    }                      
                }
                window.dispatchEvent(new CustomEvent('INJECTION_DONE', {detail :{baseUrl}}));
            } else {
                console.log('Loading failed.');
            }

        });

        frame.on('loaded', function(frame, loadSuccess) {
            // it failed
            if (!loadSuccess) {
                frame.close();
            }
        });

        frame.on('close', () => {
            frame.running = false;
            this.running -= 1;
        });
    }
}