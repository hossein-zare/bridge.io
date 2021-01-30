const Clients = require('./clients');
const ChannelStorage = require('./channel-storage');

class Channel {
    /**
     * Broadcast to an specific channel.
     * @param {string|array} channels 
     * @returns {object}
     */
    static channel(channels) {
        const subscribers = ChannelStorage.subscribers(channels);
        const isWebSocket = this.constructor.name === 'WebSocket';

        return {
            cast: (event, data) => {
                subscribers.forEach(subscriber => {
                    const client = Clients.get(subscriber);
                    
                    if (isWebSocket && client === this)
                        return;

                    client.cast(event, data);
                });
            }
        };
    }
}

module.exports = Channel;