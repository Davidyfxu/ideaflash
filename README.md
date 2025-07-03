# IdeaFlash 💡

A fast, lightweight Chrome extension for capturing spontaneous ideas and notes with local persistence. Built with modern web technologies for seamless note-taking without disrupting your browsing experience.

![IdeaFlash Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue)
![Built with React](https://img.shields.io/badge/Built%20with-React-61dafb)
![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-38bdf8)

## ✨ Features

### Core Functionality

- **🚀 Quick Note Capture**: Instantly capture ideas from any webpage via the extension popup
- **💾 Local Persistence**: All notes stored securely on your device using PGlite (PostgreSQL in IndexedDB)
- **🔄 Offline Support**: Full functionality without internet connection
- **⚡ Fast Performance**: Minimal resource consumption and blazing-fast load times

### Note Management

- **✏️ Edit & Delete**: Full CRUD operations for your notes
- **🏷️ Tag System**: Organize notes with customizable tags
- **🔍 Smart Search**: Fast search through notes by title, content, or tags
- **📱 Clean UI**: Beautiful, responsive interface with modern design

### User Experience

- **🌓 Dark/Light Theme**: Toggle between themes to match your preference
- **⌨️ Keyboard Shortcuts**: Quick access with `Ctrl+Shift+Y` (or `Cmd+Shift+Y` on Mac)
- **🔗 Source Links**: Automatically capture and link back to the original webpage
- **🎯 Minimal Disruption**: Designed to not interfere with your browsing

## 🛠️ Technology Stack

- **Framework**: [WXT](https://wxt.dev/) for Chrome Extension development
- **Frontend**: React 19 with TypeScript
- **Styling**: TailwindCSS + Radix UI components
- **State Management**: Zustand
- **Database**: PGlite (PostgreSQL in IndexedDB)
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📋 Requirements

- Chrome Browser (Manifest V3 compatible)
- Node.js 16+ and pnpm (for development)

## 🚀 Quick Start

### Installation from Source

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ideas-flash
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
```

## 🎯 Usage

### Getting Started

1. Click the IdeaFlash icon in your browser toolbar
2. Click "New" or use `Ctrl+Shift+Y` to open the note editor
3. Write your idea and optionally add tags
4. Press `Ctrl+Enter` (or `Cmd+Enter`) to save

### Keyboard Shortcuts

- `Ctrl+Shift+Y` (or `Cmd+Shift+Y`): Open IdeaFlash popup
- `Ctrl+Enter` (or `Cmd+Enter`): Save note in editor
- `Esc`: Close note editor

### Features Walkthrough

#### Creating Notes

- Click the "New" button or use the keyboard shortcut
- Add an optional title (auto-generated from content if empty)
- Write your note content
- Add tags for better organization
- The current webpage URL is automatically captured

#### Managing Notes

- **Edit**: Click the edit icon on any note card
- **Delete**: Click the trash icon (with confirmation)
- **Search**: Use the search bar to find notes by content or title
- **Filter**: Click the filter icon to filter by tags

#### Themes

- Use the sun/moon toggle in the header to switch themes
- Theme preference is automatically saved

## 🏗️ Architecture

### Project Structure

```
ideas-flash/
├── entrypoints/          # Extension entry points
│   ├── popup/           # Main popup interface
│   ├── background.ts    # Background script
│   └── content.ts       # Content script
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── NoteCard.tsx    # Individual note display
│   ├── NoteEditor.tsx  # Note creation/editing
│   ├── SearchBar.tsx   # Search and filtering
│   └── Header.tsx      # App header with controls
├── lib/                # Core utilities
│   ├── database.ts     # PGlite database layer
│   ├── store.ts        # Zustand state management
│   └── utils.ts        # Helper functions
└── public/             # Static assets
```

### Key Components

#### Database Layer (`lib/database.ts`)

- PGlite integration for local PostgreSQL database
- Full CRUD operations for notes and tags
- Automatic schema creation and indexing
- Optimized queries for search and filtering

#### State Management (`lib/store.ts`)

- Zustand store for reactive state management
- Actions for all database operations
- Theme and UI state management
- Error handling and loading states

#### UI Components (`components/`)

- Modern, accessible components built with Radix UI
- Consistent styling with TailwindCSS
- Responsive design for various screen sizes
- Dark/light theme support

## 🔒 Privacy & Security

- **Local Storage Only**: All data stays on your device
- **No Data Collection**: Zero telemetry or tracking
- **Secure Storage**: Data encrypted in IndexedDB
- **No Network Requests**: Fully offline functionality
- **Minimal Permissions**: Only requires necessary Chrome API access

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
- [PGlite](https://pglite.dev/) for bringing PostgreSQL to the browser
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [TailwindCSS](https://tailwindcss.com/) for utility-first CSS framework
- [Lucide](https://lucide.dev/) for beautiful icons

## 📧 Support

If you encounter any issues or have questions, please [create an issue](https://github.com/your-username/ideas-flash/issues) on GitHub.

---

**Built with ❤️ for better idea management**
