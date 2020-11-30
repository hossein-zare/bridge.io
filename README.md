# Bridge.IO
Bridge.IO is a realtime websocket framework for NodeJS.

## Features
- Broadcasting
- Private messaging
- Room support
- Acknowledgement callback
- Auto-reconnection
- Disconnection detector
- Built-in ping-pong mechanism
- Authentication

## Basic Usage
```javascript
const url = require('url');

// Bridge.IO
const BridgeIO = require('bridge.io');
const io = new BridgeIO({ noServer: true });

// SSL
const fs = require('fs');
const privateKey = fs.readFileSync('ssl/key.pem', 'utf8');
const certificate = fs.readFileSync('ssl/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create server
const https = require('https');
const express = require('express');
const app = express();
const server = https.createServer(credentials, app);

// Cors
const cors = require('cors');
app.use(cors());

io.watch('connection', (socket, request, data) => {
    console.log('A user connected');

    // New message
    socket.watch('message', (message, callback) => {
        socket.broadcast('message', message);

        callback();
    });

    // Disconnection
    socket.watch('close', () => {
        console.log('User disconnected!');
    });
});

// Upgrade
server.on('upgrade', async (request, socket, head) => {
    // Query params
    const query = url.parse(request.url, true).query;

    // Authentication (Implement your own authentication function)
    const auth = await authentication(query.token);

    io.upgrade(request, socket, head, {
        isOk: auth.status,
        data: auth.data
    });
});

// Start the server
server.listen(3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
```

## Methods & Properties
### IO
```javascript
// Casting to an specific client
io.to(id: string).cast(event: string, data: string|json);

// Casting with acknowledgement (Client Side)
io.to(id: string).cast(event: string, data: string|json, callback: () => void);

// Broadcasting to everyone
io.broadcast(event: string, data: string|json);

// Broadcasting to all clients in the specified rooms
io.room(room: string|array);
```

### Socket
```javascript
// Casting to the client
socket.cast(event: string, data: string|json);

// Broadcasting to everyone except the caster
socket.broadcast(event: string, data: string|json);

// Broadcasting to all clients in the specified rooms except the caster
socket.room(room: string|array);

// Joining a room
socket.join(room: string);

// Leaving a room
socket.leave(room: string);

// Disconnecting
socket.close(code: Number, reason: string);

// Client ID
const id = socket.id;

// Client rooms
const rooms = socket.rooms;
```