import Tool from './model/tool.js';

const path = require('path');
const fs = require('fs');

export default class ToolLoader {

    loadTools(folderPath, relFolderPath) {
        const loadedTools = [];

        const tools = fs.readdirSync(folderPath);
        for (const toolFolder of tools) {
            const configPath = path.join(folderPath, toolFolder, 'tool.config.json');
            if (fs.existsSync(configPath) && fs.statSync(configPath).isFile()) {
                try {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    const tool = new Tool(path.posix.join(relFolderPath, toolFolder));
                    tool.load(config);
                    loadedTools.push(tool);
                } catch (e) {
                    console.log('Failed to load', tool);
                    console.log(e);
                }
            }
        }
        return loadedTools;
    }
}