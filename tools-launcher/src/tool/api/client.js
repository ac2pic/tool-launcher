let instance = null;

export default class ToolCommunicationClient {
    static set comApi(comClient) {
        instance = comClient;
    }

    static get comApi() {
        return instance;
    }
    
    constructor() {}

    /**
     * 
     * @param {string} topic 
     * @param {ToolMessage} msg 
     */
    emit(topic, msg) {
        msg.setProvider(this);
        ToolCommunicationClient.comApi.emit(topic, msg);
    }

    
    onMessage(topic, message) {}


    onReply(topic, message) {}
}