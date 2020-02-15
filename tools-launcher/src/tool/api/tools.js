const path = require('path');

export default class ToolsApi {
    constructor() {
    }


    getRealAssetsPath() {
        return path.join(nw.App.startPath, 'assets/');
    }

    getChromeAssetsPath() {
        return path.posix.join(location.origin, 'assets/');
    }

}