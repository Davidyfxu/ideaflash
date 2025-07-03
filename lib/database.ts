// Type definitions for notes and tags
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  url?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

// Export the database instance
import { chromeStorageDatabase } from "./chrome-storage-database";
export const database = chromeStorageDatabase;
