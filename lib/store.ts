import { create } from "zustand";
import { database, Note } from "./database";
import { api, isApiConfigured } from "./api";
import { generateIdeaFlashId } from "./utils";
import { useAuthStore } from "./auth-store";

interface NotesStore {
  // Notes state
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  isApiEnabled: boolean;
  // Actions
  loadNotes: () => Promise<void>;
  addNote: (
    noteData: Omit<Note, "id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  updateNote: (idea_flash_id: string, noteData: Partial<Note>) => Promise<void>;
  deleteNote: (idea_flash_id: string) => Promise<void>;
  searchNotes: (term: string) => void;
  clearFilters: () => void;
  clearError: () => void;
  syncWithApi: () => Promise<void>;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  searchTerm: "",
  isApiEnabled: isApiConfigured(),

  loadNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log("Loading notes from database...");
      const notes = await database.getNotes();
      console.log("Notes loaded successfully:", notes.length);

      set({
        notes,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to load notes:", error);
      console.log("Falling back to mock data");
      set({
        notes: [],
        isLoading: false,
        error: `Database error: ${
          error instanceof Error ? error.message : "Unknown error"
        }.`,
      });
    }
  },

  addNote: async (noteData) => {
    set({ isLoading: true, error: null });
    try {
      const { isApiEnabled } = get();

      // 生成唯一的idea_flash_id，使用当前用户ID
      const { user } = useAuthStore.getState();
      const ideaFlashId = generateIdeaFlashId(user?.id);
      const params = {
        ...noteData,
        idea_flash_id: ideaFlashId,
      };
      const { isAuthenticated } = useAuthStore.getState();
      // 先保存到本地数据库
      const newNote = await database.addNote(params);
      const currentNotes = get().notes;
      set({ notes: [newNote, ...currentNotes], isLoading: false });

      // 如果API可用，异步同步到服务器
      if (isApiEnabled && isAuthenticated) {
        try {
          await api.createPost({
            title: noteData.title,
            content: noteData.content,
            idea_flash_id: ideaFlashId,
          });
          console.log("Note synced to API successfully");
        } catch (apiError) {}
      }
    } catch (error) {
      console.error("Failed to add note:", error);
      set({
        isLoading: false,
        error: `Failed to add note: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  },

  updateNote: async (idea_flash_id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { isApiEnabled } = get();
      const { isAuthenticated } = useAuthStore.getState();

      // 先更新本地数据库
      const updatedNote = await database.updateNote(idea_flash_id, updates);
      const currentNotes = get().notes;
      const updatedNotes = currentNotes.map((note) =>
        note.idea_flash_id === idea_flash_id ? updatedNote : note,
      );
      set({ notes: updatedNotes, isLoading: false });
      // 如果API可用且用户已认证，异步同步到服务器
      if (isApiEnabled && isAuthenticated) {
        try {
          // 使用idea_flash_id进行API调用
          const ideaFlashId = updatedNote.idea_flash_id || idea_flash_id;
          await api.updatePost(ideaFlashId, {
            title: updates.title || updatedNote.title,
            content: updates.content || updatedNote.content,
          });
          console.log("Note update synced to API successfully");
        } catch (apiError) {
          console.error("Failed to sync note update to API:", apiError);
          // API同步失败不影响本地操作
        }
      }
    } catch (error) {
      console.error("Failed to update note:", error);
      set({
        isLoading: false,
        error: `Failed to update note: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  },

  deleteNote: async (idea_flash_id) => {
    set({ isLoading: true, error: null });
    try {
      const { isApiEnabled } = get();
      const { isAuthenticated } = useAuthStore.getState();
      // 先删除本地数据库
      await database.deleteNote(idea_flash_id);
      const currentNotes = get().notes;
      const filteredNotes = currentNotes.filter(
        (note) => note.idea_flash_id !== idea_flash_id,
      );
      set({ notes: filteredNotes, isLoading: false });

      // 如果API可用且用户已认证，异步同步到服务器
      if (isApiEnabled && isAuthenticated) {
        try {
          // 查找要删除的笔记以获取idea_flash_id
          const noteToDelete = currentNotes.find(
            (note) => note.idea_flash_id === idea_flash_id,
          );
          const ideaFlashId = noteToDelete?.idea_flash_id || idea_flash_id;
          await api.deletePost(ideaFlashId);
          console.log("Note deletion synced to API successfully");
        } catch (apiError) {
          console.error("Failed to sync note deletion to API:", apiError);
          // API同步失败不影响本地操作
        }
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      set({
        isLoading: false,
        error: `Failed to delete note: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  },

  searchNotes: (term) => {
    set({ searchTerm: term });
    const { notes } = get();

    if (!term.trim()) {
      // If no search term, show all notes
      return;
    }

    const filteredNotes = notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(term.toLowerCase()) ||
        note.content.toLowerCase().includes(term.toLowerCase()),
    );

    set({ notes: filteredNotes });
  },

  clearFilters: () => {
    set({ searchTerm: "" });
    // Reload all notes
    get().loadNotes();
  },

  clearError: () => {
    set({ error: null });
  },

  syncWithApi: async () => {
    const { isApiEnabled } = get();
    const { isAuthenticated } = useAuthStore.getState();

    if (!isApiEnabled || !isAuthenticated) {
      console.log(
        "API not configured or user not authenticated, skipping sync",
      );
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // 从API获取所有笔记
      const apiNotes = await api.getPosts();
      const localNotes = get().notes;

      console.log("Syncing notes with API...");

      // 将API数据转换为本地格式并保存
      for (const apiNote of apiNotes) {
        // 使用idea_flash_id来匹配笔记
        const existingNote = localNotes.find(
          (note) => note.idea_flash_id === apiNote.idea_flash_id,
        );

        if (!existingNote) {
          // 新笔记，添加到本地
          await database.addNote({
            title: apiNote.title,
            content: apiNote.content,
            idea_flash_id: apiNote.idea_flash_id,
          });
        } else if (apiNote.idea_flash_id) {
          // 更新现有笔记的idea_flash_id
          await database.updateNote(existingNote.idea_flash_id, {
            idea_flash_id: apiNote.idea_flash_id,
          });
        }
      }

      // 重新加载笔记
      await get().loadNotes();

      set({ isLoading: false });
      console.log("Sync completed successfully");
    } catch (error) {
      console.error("Sync failed:", error);
      set({
        isLoading: false,
        error: `Sync failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  },
}));
