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
     * @param {Tool.Communication.Message} msg 
     */
    emit(topic, msg) {
        msg.setProvider(this);
        Client.topicInstance.emit(topic, msg);
    }

    /**
     * 
     * @param {string} topic 
     */
    subscribeTo(topic) {
        Client.topicInstance.subscribeTo(topic, this);
    }

    /**
     * 
     * @param {string} topic 
     */
    unsubscribeFrom(topic) {
        Client.topicInstance.unsubscribeFrom(topic, this);
    }

    /**
     * 
     * @param {string} topic 
     * @param {Tool.Communication.Message} message 
     */
    onMessage(topic, message) { }

    /**
     * 
     * @param {string} topic 
     * @param {Tool.Communication.Message} message 
     */
    onReply(topic, message) { }
}