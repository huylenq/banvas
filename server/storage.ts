import { users, type User, type InsertUser, type Drawing, type InsertDrawing } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveDrawing(drawing: InsertDrawing): Promise<Drawing>;
  getDrawing(id: number): Promise<Drawing | undefined>;
  getDrawingsByUserId(userId: number): Promise<Drawing[]>;
  updateDrawing(id: number, data: string): Promise<Drawing | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private drawings: Map<number, Drawing>;
  private userIdCounter: number;
  private drawingIdCounter: number;

  constructor() {
    this.users = new Map();
    this.drawings = new Map();
    this.userIdCounter = 1;
    this.drawingIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveDrawing(insertDrawing: InsertDrawing): Promise<Drawing> {
    const id = this.drawingIdCounter++;
    const drawing: Drawing = { ...insertDrawing, id };
    this.drawings.set(id, drawing);
    return drawing;
  }

  async getDrawing(id: number): Promise<Drawing | undefined> {
    return this.drawings.get(id);
  }

  async getDrawingsByUserId(userId: number): Promise<Drawing[]> {
    return Array.from(this.drawings.values()).filter(
      (drawing) => drawing.userId === userId
    );
  }

  async updateDrawing(id: number, data: string): Promise<Drawing | undefined> {
    const drawing = this.drawings.get(id);
    if (!drawing) return undefined;
    
    const updatedDrawing: Drawing = {
      ...drawing,
      data,
      updatedAt: new Date().toISOString()
    };
    
    this.drawings.set(id, updatedDrawing);
    return updatedDrawing;
  }
}

export const storage = new MemStorage();
