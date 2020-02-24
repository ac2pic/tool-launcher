import ToolCommunicationClient from './client.js';

const topic = {};

export default class ToolsCommunicationApi {
    constructor() {
    }

    addTopic(name) {
        if (this.hasTopic(name)) {
            console.warn(`Topic ${name} already exists.`);
            return;
        }
        
        topic[name] = [];
    }

    subscribeToTopic(name, subscriber) {
        if (!(subscriber instanceof ToolCommunicationClient)) {
            throw Error(`Subscriber must be an instance of ToolCommunicationClient`);
        }


        if (!this.hasTopic(name)) {
            this.addTopic(name);
        }

        if (!topic[name].includes(subscriber)) {
            topic[name].push(subscriber);
        }

    }

    hasTopic(name) {
        return Array.isArray(topic[name]);
    }

    emit(topicName, message) {
        if (this.hasTopic(topicName)) {
            for (const subscriber of topic[topicName]) {
                const clonedMessage = message.clone();

                clonedMessage.setConsumer(subscriber);
                
                subscriber.onMessage(topicName, clonedMessage);
            }
        }
    }
}