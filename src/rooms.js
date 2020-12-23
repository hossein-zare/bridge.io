const Caster = require('./caster');

class Rooms {
    static storage = new Map();

    /**
     * Join the room.
     * @param {string} room 
     * @returns {object}
     */
    static join(room) {
        if (! Rooms.storage.has(room)) {
            Rooms.storage.set(room, new Set());
        }

        Rooms.storage.get(room).add(this.id);
        this.rooms.add(room);

        return this;
    }

    /**
     * Leave the room.
     * @param {string} room 
     * @returns {object}
     */
    static leave(room) {
        if (Rooms.storage.has(room)) {
            Rooms.storage.get(room).delete(this.id);
            this.rooms.delete(room);

            if (Rooms.storage.get(room).size === 0) {
                Rooms.storage.delete(room);
            }
        }

        return this;
    }

    /**
     * Get members of a room.
     * @param {string|array} rooms 
     * @returns {array}
     */
    static members(rooms) {
        if (typeof rooms === 'string')
            rooms = [rooms];

        let members = [];
        
        // Get the members
        rooms.forEach(room => {
            const roomMembers = Rooms.storage.has(room) ? Rooms.storage.get(room) : [];
            
            if (roomMembers) {
                members.push(roomMembers);
            }
        });

        // Flatten the array and remove duplicates
        members = [...new Set(members.flat())];

        return members;
    }

    /**
     * Get all rooms.
     * @returns {object}
     */
    static all() {
        return Rooms.storage;
    }

    /**
     * Get a Room.
     * @param {string} room 
     * @returns {object}
     */
    static get(room) {
        return Rooms.storage.get(room);
    }

    /**
     * Check if the room exists.
     * @param {string} room
     * @returns {object}
     */
    static has(room) {
        return Rooms.storage.has(room);
    }

    /**
     * Cast to an specific room.
     * @param {string|array} rooms 
     * @returns {object}
     */
    static room(rooms) {
        const members = Rooms.members(rooms);

        return {
            cast: (event, data) => Caster.multicast(event, data, members, [this.id])
        };
    }
}

module.exports = Rooms;