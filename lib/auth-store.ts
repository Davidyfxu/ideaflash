import { create } from "zustand";

interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}
interface AuthState {
  // 认证状态
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isApiEnabled: boolean;

  // Actions
  initializeAuth: () => Promise<void>;
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
  isApiEnabled: true, // 本地模式下始终启用

  initializeAuth: async () => {
    set({ isLoading: true, error: null });

    try {
      // 如果有token，尝试获取用户信息
      const userId = localStorage.getItem("access_token");
      if (userId) {
        // 从localStorage获取用户信息
        const usersJson = localStorage.getItem("local_users");
        if (usersJson) {
          const users = JSON.parse(usersJson);
          const user = users.find((u: any) => u.id === userId);
          
          if (user) {
            set({
              user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name || user.email.split('@')[0],
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
        }
      }
      
      // 如果没有找到有效的用户，清除认证状态
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Auth initialization failed:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Operation failed",
        user: null,
        isAuthenticated: false,
      });
    }
  },



  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      // 清除访问令牌
      localStorage.removeItem('access_token');
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Logout failed:", error);
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
