import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());

  // Iniciar cliente Gemini Server-Side de manera segura (No usar prefijo VITE_)
  let aiClient: GoogleGenAI | null = null;
  const getAiClient = () => {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("⚠️ GEMINI_API_KEY no configurada en servidor. Peticiones fallarán.");
      }
      aiClient = new GoogleGenAI({ apiKey: apiKey || "demo-key" });
    }
    return aiClient;
  };

  // API ROUTES
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { contents, systemInstruction, temperature, topK, topP, maxOutputTokens } = req.body;
      const ai = getAiClient();
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        config: {
          systemInstruction,
          temperature,
          topK,
          topP,
          maxOutputTokens,
        }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error from Gemini API:", error);
      res.status(500).json({ error: error.message || "Failed to call Gemini" });
    }
  });

  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getAiClient();
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { temperature: 0.8, maxOutputTokens: 600, responseMimeType: "application/json" }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error generating material:", error);
      res.status(500).json({ error: error.message || "Failed to generate material" });
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
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", (err?: any) => {
    if (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
