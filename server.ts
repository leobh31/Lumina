import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./src/server/app";

const PORT = 3000;

async function startServer() {
  // Vite middleware setup for Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(expressStaticMiddleware(distPath));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Helper to avoid importing express in this light wrapper
function expressStaticMiddleware(distPath: string) {
  const express = require("express");
  const router = express.Router();
  router.use(express.static(distPath));
  router.get('*', (req: any, res: any) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  return router;
}

startServer();
