import { create } from "zustand";
import { database, Note } from "./database";

interface NotesStore {
  // Notes state
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedTags: string[];

  // Actions
  loadNotes: () => Promise<void>;
  loadTags: () => Promise<void>;
  addNote: (
    noteData: Omit<Note, "id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  updateNote: (id: string, noteData: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  searchNotes: (term: string) => void;
  filterNotesByTag: (tag: string) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  searchTerm: "",
  selectedTags: [],

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

  loadTags: async () => {
    try {
      console.log("Loading tags from database...");
      const tags = await database.getTags();
      console.log("Tags loaded successfully:", tags.length);
    } catch (error) {
      console.error("Failed to load tags:", error);
      console.log("Falling back to mock tags");
      set({
        error: `Database error: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Using mock data.`,
      });
    }
  },

  addNote: async (noteData) => {
    set({ isLoading: true, error: null });
    try {
      const { notes } = get();

      const newNote = await database.addNote(noteData);
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

  updateNote: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { notes } = get();

      const updatedNote = await database.updateNote(id, updates);
      const currentNotes = get().notes;
      const updatedNotes = currentNotes.map((note) =>
        note.id === id ? updatedNote : note,
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

  deleteNote: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await database.deleteNote(id);
      const currentNotes = get().notes;
      const filteredNotes = currentNotes.filter((note) => note.id !== id);
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
        note.content.toLowerCase().includes(term.toLowerCase()) ||
        note.tags?.some((tag) =>
          tag.toLowerCase().includes(term.toLowerCase()),
        ),
    );

    set({ notes: filteredNotes });
  },

  filterNotesByTag: (tag) => {
    set({ selectedTags: [tag] });
    const { notes } = get();

    const filteredNotes = notes.filter((note) => note.tags?.includes(tag));

    set({ notes: filteredNotes });
  },

  clearFilters: () => {
    set({ searchTerm: "", selectedTags: [] });
    // Reload all notes
    get().loadNotes();
  },

  clearError: () => {
    set({ error: null });
  },
}));
