require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

// Redis
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const PORT = process.env.PORT || 3000;
const server = http.createServer();

// Socket.io sur /socket
const io = new Server(server, {
    path: "/socket/",
    cors: { origin: "*" }
});

// --- Connexion Redis pour Socket.io adapter ---
const pubClient = createClient({ url: "redis://redis:6379" });
const subClient = pubClient.duplicate();

(async () => {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
})();

// --- Rooms et historique ---
const ROOMS = ["room1", "room2", "room3"];
const history = { room1: [], room2: [], room3: [] };

let userCount = 0;

io.on("connection", (socket) => {
    userCount++;
    io.emit("user_count", userCount);
    console.log(`Client connected: ${socket.id}`);

    // --- Join room ---
    socket.on("join_room", (room) => {
        if (!ROOMS.includes(room)) return;
        socket.join(room);
        socket.data.room = room;

        console.log(`${socket.id} joined ${room}`);

        // envoi historique au client uniquement
        socket.emit("history", { room, messages: history[room] });
    });

    // --- Messages ---
    socket.on("message", (msg) => {
        const room = socket.data.room;
        if (!room) return;

        history[room].push(msg);
        if (history[room].length > 100) history[room].shift();

        io.to(room).emit("message", { room, msg });
    });

    socket.on("disconnect", () => {
        userCount--;
        io.emit("user_count", userCount);
        console.log(`Client disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
