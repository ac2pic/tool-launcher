// import ToolLoader from "./loader.js";
import Topic from "./communication/topic.js";
import Client from "./communication/client.js";
import Message from "./communication/message.js";
import ToolFrameManager from "./frame-manager/choose.js";
import { isNw } from "../platform-check.js";
import Tool from "./model/tool.js";

export default class ToolManager {
    constructor() {
        // this.loader = new ToolLoader;
        this.frames = {};
        this.running = 0;
        this.topic = new Topic;
        this.offlineClasses = {};
        Client.topicInstance = this.topic;
        Object.freeze(this.topic);

        this.clientObject = {
            Communication: {
                Client: Client,
                Message: Message,
                Topic: this.topic
            }
        };

        Object.freeze(this.clientObject.Communication);
    }

    async getTools() {
        const tools = [];
        if (isNw) {
            const fs = require('fs');
            const path = require('path');
            // check path 
            const files = fs.readdirSync('tools');
            for (const file of files) {
                try {
                    const relativePath = path.posix.join('tools', file + '/');
                    const toolConfigPath = path.posix.join(relativePath, 'tool.config.json');
                    const toolConfig = JSON.parse(fs.readFileSync(toolConfigPath, 'utf8'));
                    toolConfig.path = '/' + relativePath;
                    tools.push(toolConfig);
                } catch (e) {}
            }
        } else {
            // ask server for all tools stuff
        }
        return tools;
    }

    async loadTools() {
        const tools = await this.getTools();
        for (const tool of tools) {
            console.log(tool);
            try {
                if (!tool.name) {
                    throw Error(`${tool.path} has no name associated with it.`);
                }

                if (this.frames[tool.name]) {
                    throw Error(`Duplicate ${tool.name} found at ${tool.path} `);
                }

            } catch (e) {
                console.log(e);
                continue;
            }

            const toolInstance = new Tool(tool.path);
            toolInstance.load(tool);

            const offlineScriptSrc = toolInstance.offlineScriptSrc;
            if (offlineScriptSrc) {
                this.offlineClasses[tool.name] = offlineScriptSrc;
            }
            const toolFrame = new ToolFrameManager(toolInstance);

            this.frames[tool.name] = toolFrame;
            this.addListeners(toolFrame, tool.name);
            
            // no longer require theses so it is possible to have hidden tools
            if (tool.htmlMain || tool.devMain) {
                this._createToolButton(toolInstance);
            }
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

        frame.open().catch(e => {
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
        const clientObject = this.clientObject;
        const offlineInstances = this.offlineClasses;

        // inject stuff here
        async function onLoad(frame, loadSuccess) {
            if (loadSuccess) {
                const window = frame.getWindow();
                window.opener = null;
                if (!window.Tool) {
                    window.Tool = clientObject;
                    Object.preventExtensions(window.Tool);
                    Object.freeze(window.Tool);
                }
                let baseUrl = '/assets/';
                if (window.location.href.startsWith("chrome")) {
                    baseUrl = location.origin + baseUrl;
                    for (const toolName in offlineInstances) {
                        window[toolName] = (await window.eval(`import("${offlineInstances[toolName]}")`)).default;
                    }
                } else {
                    baseUrl = 'http://localhost:4000' + baseUrl;
                    for (const toolName in offlineInstances) {
                        window[toolName] = (await import(offlineInstances[toolName])).default;
                    }
                }
                window.dispatchEvent(new CustomEvent('INJECTION_DONE', { detail: { baseUrl } }));
            } else {
                console.log('Loading failed.');
            }

        }

        frame.on('loaded', onLoad);

        frame.on('loaded', function (frame, loadSuccess) {
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