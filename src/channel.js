const Clients = require('./clients');
const ChannelStorage = require('./channel-storage');

class Channel {
    /**
     * Broadcast to an specific channel.
     * @param {string|array} channels
     * @param {array} except
     * @returns {object}
     */
    static channel(channels, except = []) {
        let subscribers = ChannelStorage.subscribers(channels);

        if (except.length > 0)
            subscribers = subscribers.filter(item => ! except.includes(item));
            
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