const http = require('http');
require('dotenv').config();

const PORT = process.env.FRONT_PORT || 8000;

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Soupa Chat</title>

<style>
body { font-family: sans-serif; max-width: 600px; margin: 20px auto; }
#chat { border: 1px solid #ccc; height: 250px; overflow-y: auto; padding: 5px; }
button, input { width: 100%; margin-top: 5px; }
.rooms { display: flex; gap: 5px; }
</style>
</head>

<body>

<h3>Soupa Rooms Chat</h3>

<div class="rooms">
  <button onclick="join('room1')">Room 1</button>
  <button onclick="join('room2')">Room 2</button>
  <button onclick="join('room3')">Room 3</button>
</div>

<p>Room actuelle : <b id="roomLabel">aucune</b></p>

<div id="chat"></div>
<input id="msg" placeholder="Type a message..." />
<button onclick="send()">Send</button>

<p>Users connected: <span id="userCount">0</span></p>

<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>

<script>
const socket = io("http://localhost:3000");

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const roomLabel = document.getElementById("roomLabel");
const userCountElem = document.getElementById("userCount");

let currentRoom = null;

function addLine(msg) {
    const line = document.createElement("div");
    line.textContent = msg;
    chat.appendChild(line);
    chat.scrollTop = chat.scrollHeight;
}

// --- Historique ---
socket.on("history", (data) => {
    if (data.room !== currentRoom) return;
    chat.innerHTML = "";
    data.messages.forEach(addLine);
});

// --- Messages en live ---
socket.on("message", (data) => {
    if (data.room !== currentRoom) return;
    addLine(data.msg);
});

// --- Compteur d'utilisateurs ---
socket.on("user_count", (count) => {
    userCountElem.textContent = count;
});

// --- Joindre une room ---
function join(room) {
    currentRoom = room;
    roomLabel.textContent = room;
    socket.emit("join_room", room);
}

// --- Envoyer un message ---
function send() {
    if (!currentRoom) return;
    if (input.value.trim() === "") return;

    socket.emit("message", input.value);
    input.value = "";
}

// --- Envoi avec Enter ---
input.addEventListener("keypress", e => {
    if (e.key === "Enter") send();
});
</script>

</body>
</html>
`;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

server.listen(PORT, () => console.log(`Frontend running on http://localhost:${PORT}`));
