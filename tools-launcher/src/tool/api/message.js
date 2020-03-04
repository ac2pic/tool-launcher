export default class ToolMessage {
    /**
     * 
     * @param {string} type 
     * @param {string} data 
     * @param {ToolCommunicationClient} provider
     */
    constructor(type, data, provider){
        this.type = type;
        this.data = data;
        this.provider = provider;
        this.consumer = null;
    }

    /**
     * 
     * @param {ToolCommunicationClient} provider 
     */
    setProvider(provider) {
        this.provider = provider;
    }


    /**
     * 
     * @param {ToolCommunicationClient} consumer 
     */
    setConsumer(consumer) {
        this.consumer = consumer;
    }

    /**
     * @returns {ToolMessage} 
     */
    clone() {
        return new ToolMessage(this.type, this.data, this.provider);
    }

    /**
     * 
     * @param {string} topic name
     * @param {string} type of response
     * @param {any} data needing to be transferred
     */
    reply(topic, type, data) {
        this.provider.onReply(topic, new ToolMessage(type, data, this.consumer));
    }
}