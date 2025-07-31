# IdeaFlash ⚡

A fast, lightweight Chrome extension for capturing spontaneous ideas and notes with local persistence. Built with modern web technologies for seamless note-taking without disrupting your browsing experience.

![IdeaFlash Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue)
![Built with React](https://img.shields.io/badge/Built%20with-React-61dafb)
![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-38bdf8)

## ✨ Features

### Core Functionality

- **🚀 Quick Note Capture**: Instantly capture ideas from any webpage via the extension popup
- **💾 Local Persistence**: All notes stored securely on your device using IndexedDB
- **🔄 Offline Support**: Full functionality with local storage
- **⚡ Fast Performance**: Minimal resource consumption and blazing-fast load times

### Note Management

- **✏️ Edit & Delete**: Full CRUD operations for your notes
- **🔍 Smart Search**: Fast search through notes by title and content
- **📜 History View**: Browse all your saved notes with sorting options
- **📱 Clean UI**: Beautiful, responsive interface with smooth animations

### User Experience

- **🎨 Beautiful UI**: Modern design with Framer Motion animations
- **⌨️ Keyboard Shortcuts**: Quick access with `Ctrl+Shift+Y` (or `Cmd+Shift+Y` on Mac)
- **🎯 Minimal Disruption**: Designed to not interfere with your browsing

## 🛠️ Technology Stack

- **Framework**: [WXT](https://wxt.dev/) for Chrome Extension development
- **Frontend**: React 19 with TypeScript
- **Styling**: TailwindCSS + Radix UI components
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Database**: IndexedDB for local storage
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📋 Requirements

- Chrome Browser (Manifest V3 compatible)
- Node.js 16+ and pnpm (for development)

## 🚀 Quick Start

### Installation from Source

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ideaflash.git
   cd ideaflash
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build the extension**

   ```bash
   pnpm build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3` folder

### Development

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Create extension package
pnpm zip

# Type checking
pnpm compile
```

## 🎯 Usage

### Getting Started

1. Click the IdeaFlash icon in your browser toolbar or use `Ctrl+Shift+Y`
2. Enter an optional title for your idea
3. Write your thoughts in the content area
4. Press `Ctrl+Enter` (or `Cmd+Enter`) to save quickly
5. Click "Save Idea" to store your note

### Advanced Features

#### Search & History
- Click the "History" button to view all your saved notes
- Use the search bar to find specific notes by title or content
- Sort notes by date, title, or content



#### Keyboard Shortcuts
- `Ctrl+Shift+Y` (Windows/Linux) or `Cmd+Shift+Y` (Mac): Open/close extension
- `Ctrl+Enter` or `Cmd+Enter`: Quick save while typing

## 🏗️ Architecture

### Project Structure

```
ideaflash/
├── entrypoints/          # Extension entry points
│   ├── popup/           # Main popup interface
│   │   ├── App.tsx      # Main application component
│   │   └── main.tsx     # Entry point
│   ├── background.ts    # Background script for shortcuts
│   └── content.ts       # Content script
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── NoteCard.tsx     # Individual note display
│   ├── NoteEditor.tsx   # Note editing interface
│   ├── NoteSearchDialog.tsx # Search and history
│   └── UserProfile.tsx  # User profile component
├── lib/                # Core utilities
│   ├── api.ts          # Local API client
│   ├── auth-store.ts   # User state management
│   ├── database.ts     # IndexedDB wrapper
│   ├── store.ts        # Main application state
│   └── utils.ts        # Helper functions
└── public/             # Static assets
    └── icon/           # Extension icons
```

### Key Components

#### Database Layer (`lib/database.ts`)
- IndexedDB integration for local storage
- Full CRUD operations for notes
- Automatic schema creation and indexing
- No size limitations unlike Chrome storage

#### State Management (`lib/store.ts`)
- Zustand store for reactive state management
- Actions for all database operations
- Error handling and loading states

## 🔒 Privacy & Security

- **Local First**: All data stored locally
- **Data Encryption**: Secure storage in IndexedDB
- **Minimal Permissions**: Only requires necessary Chrome API access
- **No Tracking**: Zero telemetry or analytics



## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Conventional commits for clear history
- Component-based architecture
- Responsive design principles

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [WXT](https://wxt.dev/) for excellent Chrome extension development framework
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [TailwindCSS](https://tailwindcss.com/) for utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for beautiful animations
- [Lucide](https://lucide.dev/) for beautiful icons

## 📧 Support

If you encounter any issues or have questions, please [create an issue](https://github.com/yourusername/ideaflash/issues) on GitHub.

---

**Built with ❤️ for better idea management**
