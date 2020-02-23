export default class ToolMessage {
    constructor(type, data, provider){
        this.type = type;
        this.data = data;
        this.provider = provider;
        this.consumer = null;
    }

    setConsumer(consumer) {
        this.consumer = consumer;
    }

    clone() {
        return new ToolMessage(this.type, this.data, this.provider);
    }


    reply(type, data) {
        this.provider.onReply(new ToolMessage(type, data, this.consumer));
    }
}