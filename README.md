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

## Installation
```bash
npm i bridge.io
```

## Basic Usage
### Server-Side
```javascript
const url = require('url');

// Bridge.IO
const BridgeIO = require('bridge.io');
const io = new BridgeIO({ noServer: true });

// Create server
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

io.watch('connection', (socket, request, data) => {
    console.log('A user connected');

    // New message
    socket.watch('message', (message, callback) => {
        socket.broadcast('message', 'welcome!');

        // Acknowledgement
        callback('success');
    });

    // Disconnection
    socket.watch('close', () => {
        console.log('User disconnected!');
    });
});

// Upgrade
server.on('upgrade', (request, socket, head) => {
    io.upgrade(request, socket, head, {
        isOk: true,
    });
});

// Start the server
server.listen(3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
```

### Client-Side
```javascript
const BridgeIO = require('bridge.io-client');

// The second argument is optional
const socket = new BridgeIO(`ws://localhost:3000`, {
    attempts: 2,
    timeout: 2000,
    protocol: []
});

// Connect to the server
socket.connect();

socket.on('open', () => {
    console.log('connected');

    // Cast a message when connected
    socket.cast('message', 'hello', function acknowledgement(msg) {
        console.log(msg);
    });
});

socket.on('close', () => {
    console.log('closed');
});

socket.on('reconnecting', () => {
    console.log('reconnecting');
});

socket.on('reconnected', () => {
    console.log('reconnected');
});

socket.on('message', (data) => {
    console.log(data);
});

socket.on('error', () => {
    console.log('error');
});
```

## Methods & Properties
### IO
```javascript
// Casting to an specific client
io.to(id: string).cast(event: string, data: string|json);

// Broadcasting to everyone
io.broadcast(event: string, data: string|json);

// Broadcasting to all clients in the specified rooms
io.room(room: string|array);
```

### Socket
```javascript
// Casting to the client
socket.cast(event: string, data: string|json);

// Casting with acknowledgement (Client-Side)
socket.cast(event: string, data: string|json, callback: () => void);

// Broadcasting to everyone except the caster
socket.broadcast(event: string, data: string|json);

// Broadcasting to all clients in the specified rooms except the caster
socket.room(room: string|array).cast(event: string, data: string|json);

// Joining a room
socket.join(room: string);

// Leaving a room
socket.leave(room: string);

// Disconnecting the client
// https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
socket.close(code: Number, reason: string);

// Client ID
const id = socket.id;

// Client rooms
const rooms = socket.rooms;
```

## Authentication
### Server-Side
```javascript
server.on('upgrade', async (request, socket, head) => {
    // 1. Get the token from query params
    const token = url.parse(request.url, true).query.token;

    // 2. Get the token from headers (Secure)
    const token = request.headers['sec-websocket-protocol'];

    // Authentication (Implement your own authentication function)
    const auth = await authentication(token);

    io.upgrade(request, socket, head, {
        isOk: auth.status,
        data: auth.data
    });
});
```

### Client-Side
```javascript
const token = 'myToken';

// Avoid passing the token as a query parameter for security issues
const socket = new BridgeIO(`wss://localhost:3000/?token=${token}`, {
    protocol: token
});
```