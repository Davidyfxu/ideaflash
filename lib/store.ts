import { create } from "zustand";
import { database, Note } from "./database";
import { generateIdeaFlashId } from "./utils";
import { useAuthStore } from "./auth-store";

interface NotesStore {
  // Notes state
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  // Actions
  loadNotes: () => Promise<void>;
  addNote: (
    noteData: Omit<Note, "id" | "created_at" | "updated_at" | "idea_flash_id">
  ) => Promise<void>;
  updateNote: (idea_flash_id: string, noteData: Partial<Note>) => Promise<void>;
  deleteNote: (idea_flash_id: string) => Promise<void>;
  searchNotes: (term: string) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  searchTerm: "",

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
      // 生成唯一的idea_flash_id，使用匿名用户ID
      const ideaFlashId = generateIdeaFlashId("anonymous");
      const params = {
        ...noteData,
        idea_flash_id: ideaFlashId,
      };
      
      // 保存到本地数据库
      const newNote = await database.addNote(params);
      const currentNotes = get().notes;
      set({ notes: [newNote, ...currentNotes], isLoading: false });
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
      // 更新本地数据库
      const updatedNote = await database.updateNote(idea_flash_id, updates);
      const currentNotes = get().notes;
      const updatedNotes = currentNotes.map((note) =>
        note.idea_flash_id === idea_flash_id ? updatedNote : note
      );
      set({ notes: updatedNotes, isLoading: false });
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
      // 删除本地数据库中的笔记
      await database.deleteNote(idea_flash_id);
      const currentNotes = get().notes;
      const filteredNotes = currentNotes.filter(
        (note) => note.idea_flash_id !== idea_flash_id
      );
      set({ notes: filteredNotes, isLoading: false });
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
        note.content.toLowerCase().includes(term.toLowerCase())
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

}));
