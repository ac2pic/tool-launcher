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
            this.addListeners(toolFrame, name);
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
                    for (const toolName in offlineInstances) {
                        window[toolName] = (await window.eval(`import("${offlineInstances[toolName]}")`)).default;
                    }
                } else {
                    for (const toolName in offlineInstances) {
                        window[toolName] = (await import(offlineInstances[toolName])).default;
                        baseUrl = 'http://localhost:4000' + baseUrl;
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