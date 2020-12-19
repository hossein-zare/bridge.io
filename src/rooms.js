const Caster = require('./caster');

class Rooms {
    static obj = {};

    /**
     * Join the room.
     * @param {string} room 
     * @returns {object}
     */
    static join(room) {
        if (! (room in Rooms.obj)) {
            Rooms.obj[room] = [];
        }

        if (! Rooms.obj[room].includes(this.id)) {
            Rooms.obj[room].push(this.id);
            this.rooms.push(room);
        }

        return this;
    }

    /**
     * Leave the room.
     * @param {string} room 
     * @returns {object}
     */
    static leave(room) {
        if (room in Rooms.obj) {
            const index = Rooms.obj[room].findIndex(item => item === this.id);

            if (index === -1)
                return this;

            Rooms.obj[room].splice(index, 1);

            // Delete the room if its empty
            if (Rooms.obj[room].length === 0)
                delete Rooms.obj[room];
            
            const roomIndex = this.rooms.findIndex(item => item === room);
            this.rooms.splice(roomIndex, 1);
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
            const roomMembers = Rooms.obj.hasOwnProperty(room) ? Rooms.obj[room] : [];
            
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
        return Rooms.obj;
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