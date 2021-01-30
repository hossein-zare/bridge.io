class ChannelStorage {
    static storage = new Map();

    /**
     * Get all channels.
     * @returns {object}
     */
    static all() {
        return this.storage;
    }

    /**
     * Get a channel.
     * @param {string} channel 
     * @returns {object}
     */
    static get(channel) {
        return this.storage.get(channel);
    }

    /**
     * Set a channel.
     * @param {string} channel 
     * @param {any} value 
     */
    static set(channel, value) {
        return this.storage.set(channel, value);
    }

    /**
     * Delete a channel.
     * @param {string} channel 
     */
    static delete(channel) {
        return this.storage.delete(channel);
    }

    /**
     * Check if the channel exists.
     * @param {string} channel
     * @returns {object}
     */
    static has(channel) {
        return this.storage.has(channel);
    }

    /**
     * Get subscribers of the channels.
     * @param {string|array} channels 
     * @returns {array}
     */
    static subscribers(channels) {
        if (typeof channels === 'string')
            channels = [channels];

        let subscribers = [];
        
        // Get the subscribers
        channels.forEach(channel => {
            const list = this.has(channel) ? Array.from(this.get(channel)) : [];
            
            if (list)
                subscribers.push(list);
        });

        // Flatten the array and remove duplicates
        subscribers = [...new Set(subscribers.flat())];

        return subscribers;
    }
}

module.exports = ChannelStorage;