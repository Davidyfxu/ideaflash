import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Sparkles, History, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NoteSearchDialog } from "@/components/NoteSearchDialog";
import { NoteEditor } from "@/components/NoteEditor";
import { Note } from "@/lib/database";
import { useNotesStore } from "@/lib/store";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);

  const { addNote, loadNotes, error } = useNotesStore();
  // Load notes from the store
  const initializeApp = async () => {
    try {
      await Promise.all([loadNotes()]);
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize app:", error);
      setIsInitialized(true);
    }
  };
  // Initialize the app
  useEffect(() => {
    void initializeApp();
  }, [loadNotes]);

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const noteData = {
        title: title.trim() || content.split("\n")[0].substring(0, 50),
        content: content.trim(),
      };

      await addNote(noteData);

      // Clear form after saving
      setTitle("");
      setContent("");

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      void handleSave();
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditDialogOpen(true);
    setSearchDialogOpen(false);
  };

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50"
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
            <Sparkles className="h-8 w-8 text-blue-500" />
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-blue-700 text-center font-medium"
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
      className="flex-1 w-full h-full bg-gradient-to-br from-blue-50 to-green-50 flex flex-col relative"
    >
      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              duration: 0.3,
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: 0.1,
              }}
              className="bg-white rounded-full p-4 shadow-2xl border-2 border-green-200"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  times: [0, 0.3, 0.6, 1],
                }}
              >
                <CheckCircle className="h-12 w-12 text-green-500" />
              </motion.div>
            </motion.div>

            {/* Success text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-center"
            >
              <motion.p
                animate={{
                  y: [0, -5, 0],
                  transition: {
                    duration: 0.8,
                    repeat: 2,
                    repeatType: "reverse",
                  },
                }}
                className="text-green-700 font-semibold text-lg bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
              >
                ✨ Idea saved successfully!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm border-b border-blue-100"
      >
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              y: [0, -3, 0, +3, 0],
              transition: {
                repeat: Infinity,
                repeatDelay: 1,
                duration: 0.5,
              },
            }}
            className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-white" />
          </motion.div>
          <h1 className="text-lg font-bold text-gray-900">IdeaFlash</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setSearchDialogOpen(true)}
            size="sm"
            variant="outline"
            className="gap-1.5 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          >
            <History className="h-4 w-4" />
            <span>History</span>
          </Button>
        </div>
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
            className="font-medium border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 placeholder:text-gray-400"
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
            className="min-h-[200px] resize-none border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 leading-relaxed placeholder:text-gray-400"
            autoFocus
          />
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-2"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={showSuccess ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={handleSave}
              disabled={!content.trim() || isSaving}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-sm text-white"
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
          className="text-xs text-gray-600 text-center bg-blue-50/50 p-2 rounded-lg"
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

      {/* Auth Dialog 已禁用 */}

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
