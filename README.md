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
const express = require('express');
const https = require('https');
const app = express();
const cors = require('cors');
const url = require('url');
const fs = require('fs');

// Bridge.IO
const BridgeIO = require('bridge.io');
const io = new BridgeIO({ noServer: true });

// SSL
const privateKey = fs.readFileSync('ssl/key.pem', 'utf8');
const certificate = fs.readFileSync('ssl/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create server
const server = https.createServer(credentials, app);

// Cors
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

// Start our server
server.listen(3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
```
