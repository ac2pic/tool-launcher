import ToolCommunicationClient from './client.js';

const topic = {};
window.topic = topic;

export default class ToolsCommunicationApi {
    constructor() {
    }

    /**
     * 
     * @param {string} name 
     */
    addTopic(name) {
        if (this.hasTopic(name)) {
            console.warn(`Topic ${name} already exists.`);
            return;
        }
        
        topic[name] = [];
    }

    /**
     * 
     * @param {string} name 
     * @param {ToolCommunicationClient} subscriber 
     */
    subToTopic(name, subscriber) {
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

    /**
     * 
     * @param {string} name 
     * @param {ToolCommunicationClient} subscriber 
     */
    unsubFromTopic(name, subscriber) {

        if (Array.isArray(topic[name])) {
            const index = topic[name].indexOf(subscriber);

            if (index > -1) {
                topic[name].splice(index, 1);
            }
        }
    }

    /**
     * 
     * @param {string} name 
     */
    hasTopic(name) {
        return Array.isArray(topic[name]);
    }

    /**
     * 
     * @param {string} topicName 
     * @param {ToolMessage} message 
     */
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