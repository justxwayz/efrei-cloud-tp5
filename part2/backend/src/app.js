require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

const server = http.createServer();

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const ROOMS = ["room1", "room2", "room3"];

// --- Cache des messages par room ---
const history = {
    room1: [],
    room2: [],
    room3: []
};

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

        // Envoi de l'historique uniquement au client
        socket.emit("history", { room, messages: history[room] });
    });

    // --- Message ---
    socket.on("message", (msg) => {
        const room = socket.data.room;
        if (!room) return;

        history[room].push(msg);

        // limite mémoire
        if (history[room].length > 100) {
            history[room].shift();
        }

        // on envoie le message avec le nom de la room
        io.to(room).emit("message", { room, msg });
    });

    socket.on("disconnect", () => {
        userCount--;
        io.emit("user_count", userCount);
        console.log(`Client disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
