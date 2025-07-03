declare namespace chrome {
  export namespace storage {
    export interface StorageArea {
      get(keys?: string | string[] | object | null): Promise<{ [key: string]: any }>;
      set(items: object): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
      clear(): Promise<void>;
      getBytesInUse(keys?: string | string[]): Promise<number>;
    }

    export interface StorageChange {
      oldValue?: any;
      newValue?: any;
    }

    export const sync: StorageArea;
    export const local: StorageArea;
    export const managed: StorageArea;
    export const session: StorageArea;

    export function onChanged: {
      addListener(callback: (changes: { [key: string]: StorageChange }, areaName: string) => void): void;
      removeListener(callback: (changes: { [key: string]: StorageChange }, areaName: string) => void): void;
      hasListener(callback: (changes: { [key: string]: StorageChange }, areaName: string) => void): boolean;
    };
  }

  export namespace tabs {
    export interface Tab {
      id?: number;
      index: number;
      windowId: number;
      highlighted: boolean;
      active: boolean;
      pinned: boolean;
      url?: string;
      title?: string;
      favIconUrl?: string;
      status?: string;
      incognito: boolean;
      width?: number;
      height?: number;
      sessionId?: string;
    }

    export function query(queryInfo: {
      active?: boolean;
      currentWindow?: boolean;
      lastFocusedWindow?: boolean;
      status?: string;
      title?: string;
      url?: string | string[];
      windowId?: number;
      windowType?: string;
      index?: number;
      highlighted?: boolean;
      pinned?: boolean;
    }): Promise<Tab[]>;

    export function get(tabId: number): Promise<Tab>;
    export function create(createProperties: {
      windowId?: number;
      index?: number;
      url?: string;
      active?: boolean;
      pinned?: boolean;
      openerTabId?: number;
    }): Promise<Tab>;
  }

  export namespace runtime {
    export interface MessageSender {
      tab?: tabs.Tab;
      frameId?: number;
      id?: string;
      url?: string;
      tlsChannelId?: string;
    }

    export function sendMessage(
      message: any,
      options?: { includeTlsChannelId?: boolean }
    ): Promise<any>;

    export function sendMessage(
      extensionId: string | null,
      message: any,
      options?: { includeTlsChannelId?: boolean }
    ): Promise<any>;

    export function onMessage: {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean | Promise<any>
      ): void;
      removeListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean | Promise<any>
      ): void;
    };

    export const lastError: { message: string } | undefined;
  }
} 