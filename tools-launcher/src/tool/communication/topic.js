import Client from './client.js';

const topic = {};
window.topic = topic;

export default class Topic {
    /**
     * 
     * @param {string} topicName 
     */
    add(topicName) {
        if (this.has(topicName)) {
            console.warn(`Topic ${topicName} already exists.`);
            return;
        }

        topic[topicName] = [];
    }

    /**
     * 
     * @param {string} topicName 
     * @param {Tool.Communication.Client} subscriber 
     */
    subscribeTo(topicName, subscriber) {
        if (!(subscriber instanceof Client)) {
            throw Error(`Subscriber must be an instance of Tool.Communication.Client`);
        }


        if (!this.has(topicName)) {
            this.add(topicName);
        }

        if (!topic[topicName].includes(subscriber)) {
            topic[topicName].push(subscriber);
        }

    }

    /**
     * 
     * @param {string} topicName 
     * @param {Tool.Communication.Client} subscriber 
     */
    unsubscribeFrom(topicName, subscriber) {

        if (Array.isArray(topic[topicName])) {
            const index = topic[topicName].indexOf(subscriber);

            if (index > -1) {
                topic[topicName].splice(index, 1);
            }
        }
    }

    /**
     * 
     * @param {string} name 
     */
    has(topicName) {
        return Array.isArray(topic[topicName]);
    }

    /**
     * 
     * @param {string} topicName 
     * @param {Tool.Communication.Message} message 
     */
    emit(topicName, message) {
        if (this.has(topicName)) {
            for (const subscriber of topic[topicName]) {
                const clonedMessage = message.clone();

                clonedMessage.setConsumer(subscriber);

                subscriber.onMessage(topicName, clonedMessage);
            }
        }
    }
}