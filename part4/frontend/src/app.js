const http = require('http');
require('dotenv').config();

const PORT = process.env.FRONT_PORT || 8000;

const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Chatty Rooms</title>
<link rel="stylesheet" href="https://unpkg.com/@picocss/pico@2/css/pico.min.css">
<style>
/* ---------------- Base ---------------- */
html, body { width: 100%; height: 100%; margin: 0; padding: 0; }
body { min-height: 100vh; transition: background-color 0.3s, color 0.3s; display: flex; flex-direction: column; }

/* ---------------- Dark / Light Mode ---------------- */
html.light {
    --bg-page: #ffffff;
    --bg-header: #f0f0f0;
    --bg-main: #fafafa;
    --color-text: #000000;
    --border-color: #ccc;
}
html.dark {
    --bg-page: #0d1b2a;
    --bg-header: #112240;
    --bg-main: #1a2a4b;
    --color-text: #ffffff;
    --border-color: #2a3a5b;
}

/* ---------------- Header ---------------- */
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: var(--bg-header);
    border-bottom: 1px solid var(--border-color);
}
header h2 { margin: 0; text-align: center; flex: 1; font-weight: 600; color: var(--color-text); }
.theme-toggle button { font-size: 1.5rem; border: none; background: none; cursor: pointer; }
.user-count {
    background-color: var(--bg-main);
    color: var(--color-text);
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    border: 1px solid var(--border-color);
}

/* ---------------- Main ---------------- */
main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 1rem; background-color: var(--bg-main); }

/* ---------------- Chat ---------------- */
#chat { border: 1px solid var(--border-color); width: 90%; max-width: 600px; height: 300px; overflow-y: auto; padding: 0.5rem; margin-bottom: 0.5rem; background-color: var(--bg-page); color: var(--color-text); border-radius: 0.5rem; }

/* ---------------- Message Input ---------------- */
#msg { width: 90%; max-width: 600px; margin-bottom: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.5rem; }

/* ---------------- Rooms ---------------- */
.room-selector { margin-bottom: 1rem; width: 90%; max-width: 600px; }
.room-selector select { width: 100%; border-radius: 0.5rem; padding: 0.25rem; border: 1px solid var(--border-color); background-color: var(--bg-page); color: var(--color-text); }

/* ---------------- Button ---------------- */
button { border-radius: 0.5rem; }
</style>
</head>

<body class="dark">
<header>
    <div class="theme-toggle">
        <button id="toggle-theme">🌞</button>
    </div>
    <h2>Chatty Rooms</h2>
    <div class="user-count">Users connected: <span id="userCount">0</span></div>
</header>

<main>
    <div class="room-selector">
        <label for="roomSelect">Choose a room:</label>
        <select id="roomSelect">
            <option value="room1">Room 1</option>
            <option value="room2">Room 2</option>
            <option value="room3">Room 3</option>
        </select>
    </div>

    <div id="chat"></div>
    <input id="msg" placeholder="Type a message..." />
    <button onclick="send()">Send</button>
</main>

<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
<script>
const socket = io({ path: "/socket/", transports: ["websocket"] });

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const userCountElem = document.getElementById("userCount");
const roomSelect = document.getElementById("roomSelect");
const htmlEl = document.documentElement;
const toggleBtn = document.getElementById("toggle-theme");

let currentRoom = roomSelect.value;

// ---------------- Dark/Light Toggle ----------------
if(localStorage.getItem('dark-mode')==='false'){
    htmlEl.classList.remove('dark'); htmlEl.classList.add('light'); toggleBtn.textContent='🌙';
} else { htmlEl.classList.add('dark'); toggleBtn.textContent='🌞'; }

toggleBtn.addEventListener('click', () => {
    htmlEl.classList.toggle('dark');
    htmlEl.classList.toggle('light');
    toggleBtn.textContent = htmlEl.classList.contains('dark') ? '🌞' : '🌙';
    localStorage.setItem('dark-mode', htmlEl.classList.contains('dark'));
});

// ---------------- Rooms ----------------
roomSelect.addEventListener('change', () => {
    currentRoom = roomSelect.value;
    socket.emit("join_room", currentRoom);
});

// ---------------- Messages ----------------
function addLine(msg){
    const line = document.createElement("div");
    line.textContent = msg;
    chat.appendChild(line);
    chat.scrollTop = chat.scrollHeight;
}

socket.on("history", (data) => {
    if(data.room !== currentRoom) return;
    chat.innerHTML = "";
    data.messages.forEach(addLine);
});

socket.on("message", (data) => {
    if(data.room !== currentRoom) return;
    addLine(data.msg);
});

// ---------------- User Count ----------------
socket.on("user_count", count => { userCountElem.textContent = count; });

// ---------------- Send Message ----------------
function send(){
    if(!currentRoom || input.value.trim()==='') return;
    socket.emit("message", input.value);
    input.value = "";
}

input.addEventListener("keypress", e => { if(e.key==="Enter") send(); });

// ---------------- Initial Room Join ----------------
socket.emit("join_room", currentRoom);
</script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

server.listen(PORT, () => console.log(`Frontend running on port ${PORT}`));
