require('dotenv').config();
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ port: PORT });
console.log(`Backend running on ws://localhost:${PORT}`);

let userCount = 0;

wss.on("connection", (ws) => {
    userCount++;
    console.log(`Client connected. Users connected: ${userCount}`);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "user_count", value: userCount }));
        }
    });

    ws.on("message", (data) => {
        const message = data.toString();
        console.log(`Message received: ${message}`);

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "message", value: message }));
            }
        });
    });

    ws.on("close", () => {
        userCount--;
        console.log(`Client disconnected. Users connected: ${userCount}`);

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "user_count", value: userCount }));
            }
        });
    });
});
