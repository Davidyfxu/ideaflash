// Type definitions for notes
export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  idea_flash_id: string;
}

// Export the database instance
// import { chromeStorageDatabase } from "./chrome-storage-database";
import { indexedDBDatabase } from "./indexeddb-database";

// Use IndexedDB for much larger storage capacity (vs Chrome Storage's ~5MB limit)
export const database = indexedDBDatabase;
