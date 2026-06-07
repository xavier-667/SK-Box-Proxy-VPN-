import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import net from "net";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Ping Testing
  app.post("/api/ping", (req, res) => {
    const { host, port } = req.body;
    
    if (!host) {
      return res.status(400).json({ error: "Host is required" });
    }

    const targetPort = parseInt(port, 10) || 443;
    const start = Date.now();
    const socket = new net.Socket();
    
    socket.setTimeout(3000);

    let isDone = false;

    socket.on("connect", () => {
      const ms = Date.now() - start;
      if (!isDone) {
        isDone = true;
        res.json({ ms, status: 'done' });
        socket.destroy();
      }
    });

    socket.on("timeout", () => {
      if (!isDone) {
        isDone = true;
        res.json({ ms: -1, status: 'error' });
        socket.destroy();
      }
    });

    socket.on("error", () => {
      if (!isDone) {
        isDone = true;
        res.json({ ms: -1, status: 'error' });
      }
    });

    try {
      socket.connect(targetPort, host);
    } catch {
      if (!isDone) {
        isDone = true;
        res.json({ ms: -1, status: 'error' });
      }
    }
  });

  // API Route for real Host Checker
  app.post("/api/check-host", (req, res) => {
    const { host, port, method } = req.body;
    
    if (!host) {
      return res.status(400).json({ error: "Host is required" });
    }

    const targetPort = parseInt(port, 10) || 443;
    const logs: { text: string; type: 'info' | 'success' | 'error' | 'header' }[] = [];

    logs.push({ text: `Resolving host: ${host}...`, type: 'info' });

    const socket = new net.Socket();
    socket.setTimeout(5000); // 5 sec timeout

    let isConnected = false;

    socket.on("connect", () => {
      isConnected = true;
      logs.push({ text: `Connected successfully to ${socket.remoteAddress}:${targetPort}.`, type: 'info' });
      
      // Simulate/Send Handshake based on method conceptually
      logs.push({ text: `> ${method || 'HEAD'} / HTTP/1.1`, type: 'header' });
      logs.push({ text: `> Host: ${host}`, type: 'header' });
      logs.push({ text: `> User-Agent: SKBox/1.0 (Real Test)`, type: 'header' });
      logs.push({ text: `> Accept: */*`, type: 'header' });
      logs.push({ text: `>`, type: 'header' });

      // We actually write a simple payload
      socket.write(`${method || 'HEAD'} / HTTP/1.1\r\nHost: ${host}\r\nUser-Agent: SKBox/1.0\r\nAccept: */*\r\nConnection: close\r\n\r\n`);
    });

    socket.on("data", (data) => {
      const responseText = data.toString();
      const firstLine = responseText.split('\r\n')[0];
      
      logs.push({ text: `< ${firstLine}`, type: 'success' });
      logs.push({ text: `Host is ALIVE and reachable.`, type: 'success' });
      
      socket.destroy(); // Got what we needed, close connection
    });

    socket.on("timeout", () => {
      logs.push({ text: `Failed to connect: Connection timed out.`, type: 'error' });
      logs.push({ text: `Host might be blocked or unreachable.`, type: 'error' });
      socket.destroy();
    });

    socket.on("error", (err) => {
      if (!isConnected) {
        logs.push({ text: `Failed to connect: ${err.message}.`, type: 'error' });
        logs.push({ text: `Host might be blocked or unreachable.`, type: 'error' });
      }
    });

    socket.on("close", () => {
      res.json({ logs, success: isConnected });
    });

    try {
      logs.push({ text: `Connecting to ${host}:${targetPort}...`, type: 'info' });
      socket.connect(targetPort, host);
    } catch (err: any) {
      logs.push({ text: `Socket error: ${err.message}`, type: 'error' });
      res.json({ logs, success: false });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
