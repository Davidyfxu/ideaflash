import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "IdeaFlash",
    description:
      "A fast, lightweight Chrome extension for capturing spontaneous ideas and notes with local persistence",
    version: "1.0.0",
    permissions: ["activeTab", "storage", "tabs", "identity"],
    host_permissions: [
      "https://*.supabase.co/*",
      "https://accounts.google.com/*",
      "https://oauth2.googleapis.com/*",
      "https://supa-be.zeabur.app/*",
    ],
    commands: {
      "toggle-popup": {
        suggested_key: {
          default: "Ctrl+Shift+Y",
          mac: "Command+Shift+Y",
        },
        description: "Toggle IdeaFlash popup",
      },
    },
    action: {
      default_title: "IdeaFlash - Quick Note Taking",
      default_popup: "popup.html",
    },
    icons: {
      "16": "/icon/16.svg",
      "32": "/icon/32.svg",
      "48": "/icon/48.svg",
      "96": "/icon/96.svg",
      "128": "/icon/128.svg",
    },
    web_accessible_resources: [
      {
        resources: ["icon/*.svg", "idea-flash.svg"],
        matches: ["<all_urls>"],
      },
    ],
  },
});
