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
    noteData: Omit<Note, "id" | "created_at" | "updated_at" | "idea_flash_id">
  ) => Promise<void>;
  updateNote: (idea_flash_id: string, noteData: Partial<Note>) => Promise<void>;
  deleteNote: (idea_flash_id: string) => Promise<void>;
  searchNotes: (term: string) => void;
  clearFilters: () => void;
  clearError: () => void;
  mergeWithApi: () => Promise<void>;
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
        note.idea_flash_id === idea_flash_id ? updatedNote : note
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
        (note) => note.idea_flash_id !== idea_flash_id
      );
      set({ notes: filteredNotes, isLoading: false });

      // 如果API可用且用户已认证，异步同步到服务器
      if (isApiEnabled && isAuthenticated) {
        try {
          // 查找要删除的笔记以获取idea_flash_id
          const noteToDelete = currentNotes.find(
            (note) => note.idea_flash_id === idea_flash_id
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

  // 登录后合并本地和远程数据
  mergeWithApi: async () => {
    const { isApiEnabled } = get();
    const { isAuthenticated, user } = useAuthStore.getState();

    if (!isApiEnabled || !isAuthenticated || !user?.id) {
      console.log(
        "API not configured or user not authenticated, skipping merge"
      );
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // 从API获取所有笔记
      const { data: apiNotes } = await api.getPosts();
      const localNotes = get().notes;

      console.log("Merging local and remote notes...");

      // 1. 处理API笔记：添加到本地（如果不存在）
      for (const apiNote of apiNotes) {
        const existingNote = localNotes.find(
          (note) => note.idea_flash_id === apiNote.idea_flash_id
        );

        if (!existingNote) {
          // 新笔记，添加到本地
          await database.addNote({
            title: apiNote.title,
            content: apiNote.content,
            idea_flash_id: apiNote.idea_flash_id,
          });
        }
      }

      // 2. 处理本地笔记：检查是否需要上传到API
      for (const localNote of localNotes) {
        // 检查是否是匿名笔记（时间戳_anonymous格式）
        const isAnonymousNote = localNote.idea_flash_id.includes("_anonymous");

        if (isAnonymousNote) {
          // 生成新的idea_flash_id
          const newIdeaFlashId = generateIdeaFlashId(user.id);

          try {
            // 上传到API
            await api.createPost({
              title: localNote.title,
              content: localNote.content,
              idea_flash_id: newIdeaFlashId,
            });

            // 删除本地数据库中的匿名笔记
            await database.deleteNote(localNote.idea_flash_id);

            console.log(
              `Uploaded and deleted anonymous note: ${localNote.idea_flash_id} -> ${newIdeaFlashId}`
            );
          } catch (apiError) {
            console.error("Failed to upload anonymous note:", apiError);
          }
        } else {
          // 检查本地笔记是否在API中存在
          const apiNote = apiNotes.find(
            (note) => note.idea_flash_id === localNote.idea_flash_id
          );

          if (!apiNote) {
            // 本地笔记不在API中，上传到API
            try {
              await api.createPost({
                title: localNote.title,
                content: localNote.content,
                idea_flash_id: localNote.idea_flash_id,
              });

              // 删除本地数据库中的笔记
              await database.deleteNote(localNote.idea_flash_id);

              console.log(
                `Uploaded and deleted local note: ${localNote.idea_flash_id}`
              );
            } catch (apiError) {
              console.error("Failed to upload local note:", apiError);
            }
          }
        }
      }

      // 3. 重新请求线上数据，确保本地数据与线上保持一致
      console.log("Re-fetching online data to ensure consistency...");
      try {
        const { data: updatedApiNotes } = await api.getPosts();

        // 清空本地数据库中的所有笔记
        await database.clearAllNotes();

        // 将最新的线上数据重新加载到本地数据库
        for (const apiNote of updatedApiNotes) {
          await database.addNote({
            title: apiNote.title,
            content: apiNote.content,
            idea_flash_id: apiNote.idea_flash_id,
          });
        }

        console.log(
          `Re-loaded ${updatedApiNotes.length} notes from API to local database`
        );
      } catch (refetchError) {
        console.error("Failed to re-fetch online data:", refetchError);
      }

      // 重新加载笔记
      await get().loadNotes();

      set({ isLoading: false });
      console.log("Merge completed successfully");
    } catch (error) {
      console.error("Merge failed:", error);
      set({
        isLoading: false,
        error: `Merge failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  },
}));
