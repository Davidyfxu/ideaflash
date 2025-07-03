import { Note, Tag } from "./database";

class ChromeStorageDatabase {
  private static NOTES_KEY = "notes";
  private static TAGS_KEY = "tags";

  // 内存缓存
  private notesCache: Note[] | null = null;
  private tagsCache: Tag[] | null = null;

  constructor() {
    // 监听存储变化，更新缓存
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local") return;

      if (changes[ChromeStorageDatabase.NOTES_KEY]) {
        this.notesCache =
          changes[ChromeStorageDatabase.NOTES_KEY].newValue || [];
      }
      if (changes[ChromeStorageDatabase.TAGS_KEY]) {
        this.tagsCache = changes[ChromeStorageDatabase.TAGS_KEY].newValue || [];
      }
    });
  }

  // 私有方法：确保存储已初始化
  private async ensureInitialized(): Promise<void> {
    try {
      if (this.notesCache === null || this.tagsCache === null) {
        const { notes, tags } = await chrome.storage.local.get([
          ChromeStorageDatabase.NOTES_KEY,
          ChromeStorageDatabase.TAGS_KEY,
        ]);

        this.notesCache = notes || [];
        this.tagsCache = tags || [];

        // 如果存储为空，初始化它
        if (!notes) {
          await chrome.storage.local.set({
            [ChromeStorageDatabase.NOTES_KEY]: [],
          });
        }
        if (!tags) {
          await chrome.storage.local.set({
            [ChromeStorageDatabase.TAGS_KEY]: [],
          });
        }
      }
    } catch (error) {
      console.error("Failed to initialize storage:", error);
      throw new Error("Storage initialization failed");
    }
  }

  // 私有方法：验证笔记数据
  private validateNote(note: Partial<Note>): void {
    if (!note.title?.trim() && !note.content?.trim()) {
      throw new Error("Note must have either a title or content");
    }
  }

  async addNote(
    note: Omit<Note, "id" | "created_at" | "updated_at">
  ): Promise<Note> {
    await this.ensureInitialized();
    this.validateNote(note);

    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const now = new Date().toISOString();

    const newNote: Note = {
      id,
      ...note,
      tags: note.tags || [],
      created_at: now,
      updated_at: now,
    };

    this.notesCache = [...this.notesCache!, newNote];
    await chrome.storage.local.set({
      [ChromeStorageDatabase.NOTES_KEY]: this.notesCache,
    });

    return newNote;
  }

  async updateNote(
    id: string,
    updates: Partial<Omit<Note, "id" | "created_at">>
  ): Promise<Note> {
    await this.ensureInitialized();
    this.validateNote(updates);

    const noteIndex = this.notesCache!.findIndex((note) => note.id === id);
    if (noteIndex === -1) {
      throw new Error(`Note with id ${id} not found`);
    }

    const now = new Date().toISOString();
    const updatedNote: Note = {
      ...this.notesCache![noteIndex],
      ...updates,
      updated_at: now,
    };

    this.notesCache![noteIndex] = updatedNote;
    await chrome.storage.local.set({
      [ChromeStorageDatabase.NOTES_KEY]: this.notesCache,
    });

    return updatedNote;
  }

  async deleteNote(id: string): Promise<void> {
    await this.ensureInitialized();

    this.notesCache = this.notesCache!.filter((note) => note.id !== id);
    await chrome.storage.local.set({
      [ChromeStorageDatabase.NOTES_KEY]: this.notesCache,
    });
  }

  async getNotes(limit?: number): Promise<Note[]> {
    await this.ensureInitialized();

    const sortedNotes = [...this.notesCache!].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return limit ? sortedNotes.slice(0, limit) : sortedNotes;
  }

  async searchNotes(searchTerm: string): Promise<Note[]> {
    await this.ensureInitialized();

    const searchTermLower = searchTerm.toLowerCase();
    return this.notesCache!.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTermLower) ||
        note.content.toLowerCase().includes(searchTermLower)
    ).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getNotesByTag(tag: string): Promise<Note[]> {
    await this.ensureInitialized();

    return this.notesCache!.filter((note) => note.tags.includes(tag)).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async addTag(tag: Omit<Tag, "id" | "created_at">): Promise<Tag> {
    await this.ensureInitialized();

    // 验证标签名称唯一性
    if (this.tagsCache!.some((t) => t.name === tag.name)) {
      throw new Error(`Tag with name "${tag.name}" already exists`);
    }

    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const now = new Date().toISOString();

    const newTag: Tag = {
      id,
      ...tag,
      created_at: now,
    };

    this.tagsCache = [...this.tagsCache!, newTag];
    await chrome.storage.local.set({
      [ChromeStorageDatabase.TAGS_KEY]: this.tagsCache,
    });

    return newTag;
  }

  async getTags(): Promise<Tag[]> {
    await this.ensureInitialized();
    return this.tagsCache!;
  }

  async deleteTag(id: string): Promise<void> {
    await this.ensureInitialized();

    this.tagsCache = this.tagsCache!.filter((tag) => tag.id !== id);
    await chrome.storage.local.set({
      [ChromeStorageDatabase.TAGS_KEY]: this.tagsCache,
    });
  }

  // 清除缓存（用于调试或重置）
  async clearCache(): Promise<void> {
    this.notesCache = null;
    this.tagsCache = null;
    await this.ensureInitialized();
  }
}

export const chromeStorageDatabase = new ChromeStorageDatabase();
