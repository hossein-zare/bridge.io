const Utils = require('./utils');
const Clients = require('./clients');
const Channel = require('./channel');
const ChannelStorage = require('./channel-storage');

class Socket {
    /**
     * Add methods and properties to the socket.
     * @param {object} socket 
     */
    static add(socket) {
        socket.id = Utils.generateUID();
        socket.isAlive = true;
        socket.channels = new Set();
        socket.cast = this.cast;
        socket.broadcast = this.broadcast;
        socket.subscribe = this.subscribe;
        socket.unsubscribe = this.unsubscribe;
        socket.channel = Channel.channel;
    }

    /**
     * Cast a message.
     * @param {string} event 
     * @param {any} data 
     * @param {number} id 
     */
    static cast(event, data = null, id) {
        let message;
            message = [event, data, id];
            message = Utils.outgoingMessage(message);

        if (this.readyState === 1)
            this.send(message);
    }

    /**
     * Broadcast a message to everyone except the client.
     * @param {string} event 
     * @param {any} data
     */
    static broadcast(event, data = null) {
        let message;
            message = [event, data];
            message = Utils.outgoingMessage(message);

        Clients.all().forEach(client => {
            if (client !== this && client.readyState === 1)
                client.send(message);
        });
    }

    /**
     * Subscribe to the channel.
     * @param {string} channel 
     * @returns {object}
     */
    static subscribe(channel) {
        if (! ChannelStorage.has(channel)) {
            ChannelStorage.set(channel, new Set());
        }

        ChannelStorage.get(channel).add(this.id);
        this.channels.add(channel);

        return this;
    }

    /**
     * Unsubscribe from the channel.
     * @param {string} channel 
     * @returns {object}
     */
    static unsubscribe(channel) {
        if (ChannelStorage.has(channel)) {
            ChannelStorage.get(channel).delete(this.id);
            this.channels.delete(channel);

            if (ChannelStorage.get(channel).size === 0) {
                ChannelStorage.delete(channel);
            }
        }

        return this;
    }
}

module.exports = Socket;