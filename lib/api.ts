// API客户端配置
// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 用户类型定义
export interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

// 笔记类型定义
export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  idea_flash_id: string;
}

// 认证响应类型
export interface AuthResponse {
  session: {
    access_token: string;
  };
  user: User;
}

// API客户端类
class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // 从localStorage获取token
    this.accessToken = localStorage.getItem("access_token");
  }

  // 设置认证token
  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }

  // 获取认证headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }
  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }
  // 认证相关API
  async register(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // 保存token
    if (response.session?.access_token) {
      this.setAccessToken(response.session.access_token);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", {
        method: "POST",
        body: JSON.stringify({}),
      });
    } finally {
      // 无论请求是否成功，都清除本地token
      this.setAccessToken(null);
    }
  }

  // 生成唯一的idea_flash_id
  private generateIdeaFlashId(userId?: string): string {
    const timestamp = Date.now();
    const userIdPart = userId || "anonymous";
    return `${timestamp}_${userIdPart}`;
  }

  // 笔记相关API
  async getPosts(): Promise<Note[]> {
    return this.request<Note[]>("/posts");
  }

  async createPost(data: {
    title: string;
    content: string;
    idea_flash_id?: string;
  }): Promise<Note> {
    const ideaFlashId = data.idea_flash_id;
    return this.request<Note>("/posts", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        idea_flash_id: ideaFlashId,
      }),
    });
  }

  async updatePost(
    ideaFlashId: string,
    data: { title: string; content: string },
  ): Promise<Note> {
    return this.request<Note>(`/posts/${ideaFlashId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePost(ideaFlashId: string): Promise<void> {
    return this.request<void>(`/posts/${ideaFlashId}`, {
      method: "DELETE",
      body: JSON.stringify({}),
    });
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient(API_BASE_URL);

// 导出便捷函数
export const api = {
  // 认证
  register: (email: string, password: string) =>
    apiClient.register(email, password),
  login: (email: string, password: string) => apiClient.login(email, password),
  logout: () => apiClient.logout(),

  // 笔记
  getPosts: () => apiClient.getPosts(),
  createPost: (data: {
    title: string;
    content: string;
    idea_flash_id: string;
  }) => apiClient.createPost(data),
  updatePost: (ideaFlashId: string, data: { title: string; content: string }) =>
    apiClient.updatePost(ideaFlashId, data),
  deletePost: (ideaFlashId: string) => apiClient.deletePost(ideaFlashId),
};

// 检查API是否已配置
export const isApiConfigured = (): boolean => {
  // @ts-ignore
  return !!import.meta.env.VITE_API_BASE_URL;
};
