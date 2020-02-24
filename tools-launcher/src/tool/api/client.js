export default class ToolCommunicationClient {
    static comApi = null;
    constructor() {}

    emit(topic, msg) {
        msg.setProvider(this);
        ToolCommunicationClient.comApi.emit(topic, msg);
    }

    
    onMessage(topic, message) {}


    onReply(topic, message) {}
}