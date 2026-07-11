import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Import the Vercel serverless handlers
import healthHandler from "./api/health.js";
import generateRetreatHandler from "./api/generate-retreat.js";
import assistantHandler from "./api/assistant.js";
import generateDynamicHandler from "./api/generate-dynamic.js";
import retreatsListHandler from "./api/retreats.js";
import retreatDetailHandler from "./api/retreats/[id].js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Register API endpoints locally, delegating to the unified Serverless Functions
app.get("/api/health", healthHandler);
app.post("/api/generate-retreat", generateRetreatHandler);
app.post("/api/assistant", assistantHandler);
app.post("/api/generate-dynamic", generateDynamicHandler);
app.all("/api/retreats", retreatsListHandler);

// Dynamic Express endpoint mapped to Vercel query parameter style
app.all("/api/retreats/:id", (req: any, res: any) => {
  req.query = req.query || {};
  req.query.id = req.params.id; // Align Express dynamic parameter with Vercel query parameter
  return retreatDetailHandler(req, res);
});

// Vite middleware and static serving
async function startServer() {
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
