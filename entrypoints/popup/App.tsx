import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Sparkles, History, CheckCircle, Cloud } from "lucide-react";
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
  const [draftSaving, setDraftSaving] = useState(false);

  const {
    addNote,
    loadNotes,
    error,
    updateDraft,
    saveDraft,
    loadDraft,
    clearDraft,
    getDraft,
  } = useNotesStore();
  // Load notes from the store
  const initializeApp = async () => {
    try {
      await Promise.all([loadNotes()]);
      // Load any existing draft
      loadDraft();
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize app:", error);
      setIsInitialized(true);
    }
  };

  // Initialize the app
  useEffect(() => {
    void initializeApp();
  }, [loadNotes, loadDraft]);

  // Load draft content when component mounts
  useEffect(() => {
    if (isInitialized) {
      const draft = getDraft();
      if (draft.content || draft.title) {
        setTitle(draft.title);
        setContent(draft.content);
      }
    }
  }, [isInitialized, getDraft]);

  // Auto-save draft when content changes
  useEffect(() => {
    if (isInitialized && (title || content)) {
      setDraftSaving(true);
      const timeoutId = setTimeout(() => {
        updateDraft(title, content);
        setDraftSaving(false);
      }, 500); // Debounce for 500ms

      return () => {
        clearTimeout(timeoutId);
        setDraftSaving(false);
      };
    }
  }, [title, content, isInitialized, updateDraft]);

  // Auto-save draft when window/popup is about to close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (content.trim() && !isSaving) {
        // If there's unsaved content, save it as draft
        updateDraft(title, content);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && content.trim() && !isSaving) {
        // When popup becomes hidden, save draft
        updateDraft(title, content);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Final attempt to save draft when component unmounts
      if (content.trim() && !isSaving) {
        updateDraft(title, content);
      }
    };
  }, [title, content, isSaving, updateDraft]);

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

      // Clear the draft since we've saved the note
      clearDraft();

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
        className="w-full h-full flex items-center justify-center bg-background"
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
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-foreground text-center font-medium"
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
      className="flex-1 w-full h-full bg-background flex flex-col relative"
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
              className="bg-popover rounded-full p-4 shadow-2xl border-2 border-border"
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
                <CheckCircle className="h-12 w-12 text-secondary" />
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
                className="text-primary font-semibold text-lg bg-popover/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
              >
                Saved!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-3 bg-white/95 backdrop-blur-sm border-b border-primary/20"
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
            className="flex items-center justify-center w-7 h-7 gradient-primary rounded-lg shadow-md"
          >
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </motion.div>
          <h1 className="text-lg font-bold text-foreground">IdeaFlash</h1>
          {draftSaving && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/30 px-2 py-1 rounded-full"
            >
              <Cloud className="h-3 w-3 animate-pulse" />
              <span>Auto-saving</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setSearchDialogOpen(true)}
            size="sm"
            variant="outline"
            className="border-border hover:bg-accent hover:border-ring p-2"
            aria-label="View History"
          >
            <History className="h-4 w-4" />
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
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-medium border-border focus:border-ring focus:ring-ring/20 placeholder:text-muted-foreground"
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
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-none border-border focus:border-ring focus:ring-ring/20 leading-relaxed placeholder:text-muted-foreground"
            autoFocus
          />
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
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
              className="w-full gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl text-white transition-all duration-300 transform hover:scale-[1.02]"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </motion.div>
        </motion.div>

        {/* Keyboard shortcut hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground text-center bg-muted/50 p-3 rounded-xl border border-border/50"
        >
          <div className="flex items-center justify-center gap-2">
            <kbd className="px-2 py-1 bg-popover rounded-md shadow-sm text-xs font-mono border border-border">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-popover rounded-md shadow-sm text-xs font-mono border border-border">
              Enter
            </kbd>
            <span className="ml-2">to save</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <kbd className="px-2 py-1 bg-popover rounded-md shadow-sm text-xs font-mono border border-border">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-popover rounded-md shadow-sm text-xs font-mono border border-border">
              Shift
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-popover rounded-md shadow-sm text-xs font-mono border border-border">
              I
            </kbd>
            <span className="ml-2">to toggle</span>
          </div>
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
