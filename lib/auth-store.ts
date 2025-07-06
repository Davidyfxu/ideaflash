import { create } from "zustand";
import { api, User, isApiConfigured } from "./api";
import { database } from "./database";

interface AuthState {
  // 认证状态
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isApiEnabled: boolean;

  // Actions
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  isApiEnabled: isApiConfigured(),

  initializeAuth: async () => {
    const { isApiEnabled } = get();

    if (!isApiEnabled) {
      console.log("API not configured, running in offline mode");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // 如果有token，尝试获取用户信息
      const token = localStorage.getItem("access_token");
      if (token) {
        // 这里可以添加一个获取当前用户信息的API端点
        // 暂时设置为已认证状态
        set({
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // 如果用户已登录，尝试合并数据
        try {
          const { useNotesStore } = await import("./store");
          await useNotesStore.getState().mergeWithApi();
        } catch (mergeError) {
          console.error(
            "Failed to merge data during initialization:",
            mergeError
          );
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Authentication failed",
        user: null,
        isAuthenticated: false,
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.login(email, password);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // 登录成功后，合并本地和远程数据
      try {
        const { useNotesStore } = await import("./store");
        await useNotesStore.getState().mergeWithApi();
      } catch (mergeError) {
        console.error("Failed to merge data after login:", mergeError);
      }
    } catch (error) {
      console.error("Login failed:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
        user: null,
        isAuthenticated: false,
      });
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.register(email, password);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // 注册成功后，合并本地和远程数据
      try {
        const { useNotesStore } = await import("./store");
        await useNotesStore.getState().mergeWithApi();
      } catch (mergeError) {
        console.error("Failed to merge data after register:", mergeError);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Registration failed",
        user: null,
        isAuthenticated: false,
      });
    }
  },

  logout: async () => {
    const { isApiEnabled } = get();

    set({ isLoading: true });

    try {
      if (isApiEnabled) {
        await api.logout();
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      // 即使API调用失败，也要清除本地状态
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Logout failed",
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

// 自动初始化认证状态
if (typeof window !== "undefined") {
  // 延迟初始化以确保扩展环境已准备好
  setTimeout(() => {
    useAuthStore.getState().initializeAuth();
  }, 100);
}
