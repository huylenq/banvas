import { db } from './db';
import { eq } from 'drizzle-orm';
import { users, drawings, type User, type InsertUser, type Drawing, type InsertDrawing } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveDrawing(drawing: InsertDrawing): Promise<Drawing>;
  getDrawing(id: number): Promise<Drawing | undefined>;
  getDrawingsByUserId(userId: number): Promise<Drawing[]>;
  updateDrawing(id: number, data: string): Promise<Drawing | undefined>;
  getAllDrawings(): Promise<Drawing[]>;
}

export class DbStorage implements IStorage {
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async saveDrawing(insertDrawing: InsertDrawing): Promise<Drawing> {
    const result = await db.insert(drawings).values(insertDrawing).returning();
    return result[0];
  }

  async getDrawing(id: number): Promise<Drawing | undefined> {
    const result = await db.select().from(drawings).where(eq(drawings.id, id));
    return result[0];
  }

  async getDrawingsByUserId(userId: number): Promise<Drawing[]> {
    return await db.select().from(drawings).where(eq(drawings.userId, userId));
  }

  async getAllDrawings(): Promise<Drawing[]> {
    return await db.select().from(drawings);
  }

  async updateDrawing(id: number, data: string): Promise<Drawing | undefined> {
    const result = await db
      .update(drawings)
      .set({ 
        data, 
        updatedAt: new Date().toISOString() 
      })
      .where(eq(drawings.id, id))
      .returning();
    
    return result[0];
  }
}

export const storage = new DbStorage();
