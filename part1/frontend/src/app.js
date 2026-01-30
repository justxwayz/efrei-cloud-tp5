const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = process.env.FRONT_PORT || 8000;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Raw WebSocket Chat</title>
  <style>
    body { font-family: sans-serif; max-width: 500px; margin: 20px auto; }
    #chat { border: 1px solid #ccc; height: 250px; overflow-y: auto; padding: 5px; }
    input, button { width: 100%; margin-top: 5px; }
  </style>
</head>
<body>

<h3>🐈 Soupa chat</h3>
<p>Users connected: <span id="userCount">0</span></p>
<div id="chat"></div>

<input id="msg" placeholder="Type a message..." />
<button onclick="send()">Send</button>

<script>
  const chat = document.getElementById("chat");
  const userCountElem = document.getElementById("userCount");

  const socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => console.log("Connected");
  socket.onclose = () => console.log("Disconnected");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if(data.type === "message") {
      const line = document.createElement("div");
      line.textContent = data.value;
      chat.appendChild(line);
      chat.scrollTop = chat.scrollHeight;
    } else if(data.type === "user_count") {
      userCountElem.textContent = data.value;
    }
  };

  function send() {
    const input = document.getElementById("msg");
    socket.send(input.value);
    input.value = "";
  }
</script>

</body>
</html>
`;

const server = http.createServer((req, res) => {
    console.log(`Frontend page requested: ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

server.listen(PORT, () => {
    console.log(`Frontend running on http://localhost:${PORT}`);
});
