const http = require('http');
require('dotenv').config();

const PORT = process.env.FRONT_PORT || 8000;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Soupa WebSocket Chat</title>
  <link rel="stylesheet" href="https://unpkg.com/@picocss/pico@2/css/pico.min.css">
  <style>
/* ---------------- Base ---------------- */
html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
}

body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Tous les blocs ont un padding uniforme */
main, header, #chat, input, button {
    box-sizing: border-box;
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    padding: 1rem 2rem;
    border-radius: 8px;
}

/* ---------------- Dark Mode ---------------- */
html.dark {
    --bg-color: #0d1b2a;          /* fond principal */
    --block-bg: #112240;          /* blocs comme chat/input */
    --text-color: #ffffff;        /* texte */
    --border-color: #1a2a4b;
}

html.dark body {
    background-color: var(--bg-color);
    color: var(--text-color);
}

html.dark header,
html.dark main,
html.dark #chat,
html.dark input,
html.dark button {
    background-color: var(--block-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

/* ---------------- Light Mode ---------------- */
html.light {
    --bg-color: #f8f8f8;         /* fond principal */
    --block-bg: #ffffff;         /* blocs comme chat/input */
    --text-color: #000000;       /* texte */
    --border-color: #cccccc;
}

html.light body {
    background-color: var(--bg-color);
    color: var(--text-color);
}

html.light header,
html.light main,
html.light #chat,
html.light input,
html.light button {
    background-color: var(--block-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

/* ---------------- Header ---------------- */
header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

header h2 {
    margin: 0 auto;
    text-align: center;
    flex: 1;
}

.toggle-theme {
    font-size: 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
}

/* ---------------- Main / Chat ---------------- */
main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}

#chat {
    width: 100%;
    max-width: 500px;
    height: 250px;
    overflow-y: auto;
    padding: 1rem;
}

/* Inputs et bouton */
input, button {
    width: 100%;
    max-width: 500px;
    font-size: 1rem;
    margin-top: 0.5rem;
}
  </style>
</head>
<body class="light">
  <header>
    <h2>🐈 Soupa Chat</h2>
    <button class="toggle-theme" onclick="toggleTheme()">🌓</button>
  </header>

  <main>
    <div id="chat"></div>
    <input id="msg" placeholder="Type a message..." />
    <button onclick="send()">Send</button>
    <p>Users connected: <span id="userCount">0</span></p>
  </main>

  <script>
    // ---------------- Dark/Light Mode ----------------
    function toggleTheme() {
        const htmlEl = document.documentElement;
        if(htmlEl.classList.contains('light')) {
            htmlEl.classList.remove('light');
            htmlEl.classList.add('dark');
        } else {
            htmlEl.classList.remove('dark');
            htmlEl.classList.add('light');
        }
    }
    // ---------------- WebSocket Chat ----------------
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

// Serveur HTTP simple
const server = http.createServer((req, res) => {
    console.log(`Frontend page requested: ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

server.listen(PORT, () => {
    console.log(`Frontend running on http://localhost:${PORT}`);
});
