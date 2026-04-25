const http = require("http");

const PORT = process.env.PORT || 3000;
let price = 1.0845;

function randomTick(current) {
  const drift = (Math.random() - 0.5) * 0.0008;
  return Math.max(0.5, +(current + drift).toFixed(5));
}

function renderPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vertex Real-Time Demo</title>
    <style>
      :root {
        --bg: #0f172a;
        --panel: #111827;
        --text: #e5e7eb;
        --accent: #22c55e;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        color: var(--text);
        background: radial-gradient(circle at 20% 20%, #1e293b, var(--bg));
      }
      .card {
        width: min(92vw, 520px);
        background: linear-gradient(145deg, #0b1220, var(--panel));
        border: 1px solid #1f2937;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 18px 45px rgba(0,0,0,.35);
      }
      h1 {
        margin: 0 0 8px;
        font-size: 1.15rem;
        letter-spacing: .05em;
        text-transform: uppercase;
        opacity: .85;
      }
      .pair { font-size: .9rem; opacity: .7; margin-bottom: 18px; }
      .price {
        font-size: clamp(2rem, 6vw, 3rem);
        font-weight: 700;
        color: var(--accent);
        margin: 0 0 10px;
      }
      .meta {
        font-size: .85rem;
        opacity: .75;
      }
      .dot {
        display: inline-block;
        width: 10px; height: 10px; border-radius: 999px;
        background: #22c55e; margin-right: 8px;
        box-shadow: 0 0 10px #22c55e;
        vertical-align: middle;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Vertex Live Feed</h1>
      <div class="pair">Pair: EUR/USD</div>
      <p class="price" id="price">--</p>
      <div class="meta"><span class="dot"></span><span id="status">connecting...</span></div>
      <div class="meta" id="updated" style="margin-top:8px;">Last update: --</div>
    </main>

    <script>
      const priceEl = document.getElementById("price");
      const statusEl = document.getElementById("status");
      const updatedEl = document.getElementById("updated");
      const source = new EventSource("/stream");

      source.onopen = () => { statusEl.textContent = "connected"; };
      source.onerror = () => { statusEl.textContent = "reconnecting..."; };
      source.onmessage = (event) => {
        const data = JSON.parse(event.data);
        priceEl.textContent = data.price.toFixed(5);
        updatedEl.textContent = "Last update: " + new Date(data.ts).toLocaleTimeString();
      };
    </script>
  </body>
</html>`;
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "vertex-demo" }));
    return;
  }

  if (req.url === "/stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const sendTick = () => {
      price = randomTick(price);
      res.write(`data: ${JSON.stringify({ pair: "EUR/USD", price, ts: Date.now() })}\n\n`);
    };

    sendTick();
    const timer = setInterval(sendTick, 1000);

    req.on("close", () => {
      clearInterval(timer);
      res.end();
    });
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(renderPage());
});

server.listen(PORT, () => {
  console.log(`vertex demo listening on http://0.0.0.0:${PORT}`);
});
