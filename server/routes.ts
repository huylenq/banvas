import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDrawingSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for drawing operations
  app.post("/api/drawings", async (req, res) => {
    try {
      const validatedData = insertDrawingSchema.parse(req.body);
      const drawing = await storage.saveDrawing(validatedData);
      return res.status(201).json(drawing);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Failed to save drawing" });
    }
  });

  app.get("/api/drawings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid drawing ID" });
      }

      const drawing = await storage.getDrawing(id);
      if (!drawing) {
        return res.status(404).json({ message: "Drawing not found" });
      }

      return res.json(drawing);
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve drawing" });
    }
  });

  app.get("/api/users/:userId/drawings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const drawings = await storage.getDrawingsByUserId(userId);
      return res.json(drawings);
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve drawings" });
    }
  });

  app.put("/api/drawings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid drawing ID" });
      }

      if (!req.body.data) {
        return res.status(400).json({ message: "Drawing data is required" });
      }

      const updatedDrawing = await storage.updateDrawing(id, req.body.data);
      if (!updatedDrawing) {
        return res.status(404).json({ message: "Drawing not found" });
      }

      return res.json(updatedDrawing);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update drawing" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
