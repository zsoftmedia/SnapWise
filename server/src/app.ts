import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./utils/env";



export async function createServer() {
  const app = express();

  // JSON + URL-encoded
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // CORS (dev-friendly)
   app.use(
    cors({
      origin: env.APP_ORIGIN, // e.g. http://localhost:3000
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type"], // no custom ngrok header needed now
    })
  );

  // Logs


  // 404
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  return app;
}
