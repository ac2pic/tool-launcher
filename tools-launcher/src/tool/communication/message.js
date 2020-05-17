export default class Message {
    /**
     * 
     * @param {string} type 
     * @param {string} data 
     * @param {Tool.Communication.Client} provider
     */
    constructor(type, data, provider) {
        this.type = type;
        this.data = data;
        this.provider = provider;
        this.consumer = null;
    }

    /**
     * 
     * @param {Tool.Communication.Client} provider 
     */
    setProvider(provider) {
        this.provider = provider;
    }


    /**
     * 
     * @param {Tool.Communication.Client} consumer 
     */
    setConsumer(consumer) {
        this.consumer = consumer;
    }

    /**
     * @returns {Tool.Communication.Message} 
     */
    clone() {
        return new Message(this.type, this.data, this.provider);
    }

    /**
     * 
     * @param {string} topic name
     * @param {string} type of response
     * @param {any} data needing to be transferred
     */
    reply(topic, type, data) {
        this.provider.onReply(topic, new Message(type, data, this.consumer));
    }
}