import { Note } from "./database";

class IndexedDBDatabase {
  private dbName = "IdeaFlashDB";
  private version = 1;
  private db: IDBDatabase | null = null;

  // 初始化数据库
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建 notes 表
        if (!db.objectStoreNames.contains("notes")) {
          const notesStore = db.createObjectStore("notes", { keyPath: "id" });
          notesStore.createIndex("created_at", "created_at", { unique: false });
          notesStore.createIndex("updated_at", "updated_at", { unique: false });
          notesStore.createIndex("title", "title", { unique: false });
          notesStore.createIndex("content", "content", { unique: false });
        }
      };
    });
  }

  // 通用的事务处理方法
  private async withTransaction<T>(
    storeNames: string | string[],
    mode: IDBTransactionMode,
    operation: (stores: IDBObjectStore | IDBObjectStore[]) => Promise<T>,
  ): Promise<T> {
    const db = await this.initDB();
    const transaction = db.transaction(storeNames, mode);

    return new Promise((resolve, reject) => {
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error("Transaction aborted"));

      const stores = Array.isArray(storeNames)
        ? storeNames.map((name) => transaction.objectStore(name))
        : transaction.objectStore(storeNames as string);

      operation(stores as any)
        .then(resolve)
        .catch(reject);
    });
  }

  // 验证笔记数据
  private validateNote(note: Partial<Note>): void {
    if (!note.title?.trim() && !note.content?.trim()) {
      throw new Error("Note must have either a title or content");
    }
  }

  async addNote(
    note: Omit<Note, "id" | "created_at" | "updated_at">,
  ): Promise<Note> {
    this.validateNote(note);

    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const now = new Date().toISOString();

    const newNote: Note = {
      id,
      ...note,
      created_at: now,
      updated_at: now,
    };

    return this.withTransaction("notes", "readwrite", async (store) => {
      return new Promise((resolve, reject) => {
        const request = (store as IDBObjectStore).add(newNote);
        request.onsuccess = () => resolve(newNote);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async updateNote(
    id: string,
    updates: Partial<Omit<Note, "id" | "created_at">>,
  ): Promise<Note> {
    this.validateNote(updates);

    return this.withTransaction("notes", "readwrite", async (store) => {
      return new Promise((resolve, reject) => {
        const getRequest = (store as IDBObjectStore).get(id);

        getRequest.onsuccess = () => {
          const existingNote = getRequest.result;
          if (!existingNote) {
            reject(new Error(`Note with id ${id} not found`));
            return;
          }

          const now = new Date().toISOString();
          const updatedNote: Note = {
            ...existingNote,
            ...updates,
            updated_at: now,
          };

          const putRequest = (store as IDBObjectStore).put(updatedNote);
          putRequest.onsuccess = () => resolve(updatedNote);
          putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
      });
    });
  }

  async deleteNote(id: string): Promise<void> {
    return this.withTransaction("notes", "readwrite", async (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = (store as IDBObjectStore).delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getNotes(limit?: number): Promise<Note[]> {
    return this.withTransaction("notes", "readonly", async (store) => {
      return new Promise<Note[]>((resolve, reject) => {
        const notes: Note[] = [];
        const index = (store as IDBObjectStore).index("created_at");
        const request = index.openCursor(null, "prev"); // 降序排列

        let count = 0;
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && (!limit || count < limit)) {
            notes.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(notes);
          }
        };

        request.onerror = () => reject(request.error);
      });
    });
  }
}

export const indexedDBDatabase = new IndexedDBDatabase();
