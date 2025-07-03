import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, Tag, Plus, Sparkles, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NoteSearchDialog } from "@/components/NoteSearchDialog";
import { NoteEditor } from "@/components/NoteEditor";
import { Note } from "@/lib/database";
import { useNotesStore } from "@/lib/store";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [isInitialized, setIsInitialized] = useState(false);

  const { addNote, deleteNote, loadNotes, loadTags, error } = useNotesStore();

  // Initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Starting app initialization...");

        const timeoutId = setTimeout(() => {
          console.log("Initialization timeout - switching to mock data");
          setIsInitialized(true);
        }, 3000);

        await Promise.all([loadNotes(), loadTags()]);
        clearTimeout(timeoutId);
        setIsInitialized(true);
        console.log("App initialized successfully");
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setIsInitialized(true);
      }
    };

    initializeApp();

    // Get current tab URL when app opens
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => {
          if (tabs[0] && tabs[0].url) {
            setCurrentUrl(tabs[0].url);
          }
        })
        .catch((error) => {
          console.warn("Failed to get current tab URL:", error);
        });
    }
  }, [loadNotes, loadTags]);

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const noteData = {
        title: title.trim() || content.split("\n")[0].substring(0, 50),
        content: content.trim(),
        tags,
        url: currentUrl,
      };

      await addNote(noteData);

      // Clear form after saving
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditDialogOpen(true);
    setSearchDialogOpen(false);
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm("Delete this idea?")) {
      try {
        await deleteNote(id);
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    }
  };

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4 p-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Sparkles className="h-8 w-8 text-indigo-500" />
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-indigo-700 text-center font-medium"
          >
            Initializing IdeaFlash...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm border-b border-indigo-100"
      >
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-white" />
          </motion.div>
          <h1 className="text-lg font-bold text-gray-900">IdeaFlash</h1>
        </div>

        <Button
          onClick={() => setSearchDialogOpen(true)}
          size="sm"
          variant="outline"
          className="gap-1.5 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
        >
          <History className="h-4 w-4" />
          <span>History</span>
        </Button>
      </motion.header>

      {/* Main Note Creation Form */}
      <motion.main
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 p-4 space-y-4"
        onKeyDown={handleKeyPress}
      >
        {/* Title */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Input
            placeholder="💡 Give your idea a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-medium border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20 placeholder:text-gray-400"
          />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1"
        >
          <Textarea
            placeholder="✨ Write your thoughts here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-none border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20 leading-relaxed placeholder:text-gray-400"
            autoFocus
          />
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-indigo-500" />
            <Input
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              className="flex-1 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20 placeholder:text-gray-400"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
              className="border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-wrap gap-1.5"
            >
              {tags.map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 cursor-pointer bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-0 hover:from-red-100 hover:to-pink-100 hover:text-red-700 transition-all duration-200"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    #{tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-2"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSave}
              disabled={!content.trim() || isSaving}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-sm text-white"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Idea"}
            </Button>
          </motion.div>
        </motion.div>

        {/* Keyboard shortcut hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-gray-600 text-center bg-indigo-50/50 p-2 rounded-lg"
        >
          💡 Tip: Press Ctrl+Enter to save quickly
        </motion.div>
      </motion.main>

      {/* Note Search Dialog */}
      <NoteSearchDialog
        isOpen={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onEditNote={handleEditNote}
      />

      {/* Note Editor Dialog */}
      <NoteEditor
        note={editingNote}
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingNote(undefined);
        }}
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}

export default App;
