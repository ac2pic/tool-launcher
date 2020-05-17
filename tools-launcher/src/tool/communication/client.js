let instance = null;

export default class Client {
    static set topicInstance(comClient) {
        if (instance === null) {
            instance = comClient;
        }
    }

    static get topicInstance() {
        return instance;
    }

    /**
     * 
     * @param {string} topic 
     * @param {ToolMessage} msg 
     */
    emit(topic, msg) {
        msg.setProvider(this);
        Client.topicInstance.emit(topic, msg);
    }


    onMessage(topic, message) { }


    onReply(topic, message) { }
}