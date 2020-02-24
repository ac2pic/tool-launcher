export default class ToolMessage {
    constructor(type, data, provider){
        this.type = type;
        this.data = data;
        this.provider = provider;
        this.consumer = null;
    }

    setProvider(provider) {
        this.provider = provider;
    }

    setConsumer(consumer) {
        this.consumer = consumer;
    }

    clone() {
        return new ToolMessage(this.type, this.data, this.provider);
    }


    reply(topic, type, data) {
        this.provider.onReply(topic, new ToolMessage(type, data, this.consumer));
    }
}