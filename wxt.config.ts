import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],

  manifest: {
    name: "IdeaFlash",
    description:
      "A fast, lightweight Chrome extension for capturing spontaneous ideas and notes with local persistence",
    version: "1.0.1",
    permissions: ["storage"],
    commands: {
      "toggle-popup": {
        suggested_key: {
          default: "Ctrl+Shift+I",
          mac: "Command+Shift+I",
        },
        description: "Toggle IdeaFlash popup",
      },
    },
    action: {
      default_title: "IdeaFlash - Quick Note Taking",
      default_popup: "popup.html",
    },
    autoIcons: {
      grayscaleOnDevelopment: false,
      sizes: [16, 32, 48, 96, 128, 192, 256, 512],
      // 保持彩色和保真度的设置
      backgroundColor: "transparent",
      padding: 0,
      // 确保SVG渲染质量
      svgOptions: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
                removeTitle: false,
                removeDesc: false,
              },
            },
          },
        ],
      },
    },
  },
});
