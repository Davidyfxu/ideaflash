import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Note } from "@/lib/database";
import { useNotesStore } from "@/lib/store";

interface NoteEditorProps {
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteEditor({ note, isOpen, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>(
    {},
  );

  const addNote = useNotesStore((state) => state.addNote);
  const updateNote = useNotesStore((state) => state.updateNote);

  // Initialize form data
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setHasChanges(false);
    } else {
      setTitle("");
      setContent("");
      setHasChanges(false);
    }
    setErrors({});
  }, [note, isOpen]);

  // Track changes
  useEffect(() => {
    if (note) {
      const hasChange =
        title !== (note.title || "") || content !== (note.content || "");
      setHasChanges(hasChange);
    } else {
      setHasChanges(title.trim() !== "" || content.trim() !== "");
    }
  }, [title, content, note]);

  const validateForm = useCallback(() => {
    const newErrors: { title?: string; content?: string } = {};

    if (!content.trim()) {
      newErrors.content = "Content is required";
    }

    if (content.trim().length > 5000) {
      newErrors.content = "Content is too long (max 5000 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [content]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const noteData = {
        title: title.trim() || content.split("\n")[0].substring(0, 50),
        content: content.trim(),
      };

      if (note?.idea_flash_id) {
        await updateNote(note.idea_flash_id, noteData);
      }

      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error("Failed to save note:", error);
      setErrors({ content: "Failed to save note. Please try again." });
    } finally {
      setIsSaving(false);
    }
  }, [title, content, note, addNote, updateNote, onClose, validateForm]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void handleSave();
      } else if (e.key === "Escape") {
        if (hasChanges) {
          if (
            window.confirm(
              "You have unsaved changes. Are you sure you want to close?",
            )
          ) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    },
    [handleSave, hasChanges, onClose],
  );
  const handleClose = useCallback(() => {
    if (hasChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to close?",
        )
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white to-indigo-50/50 border-indigo-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Sparkles className="h-5 w-5 text-indigo-500" />
              </motion.div>
              {note ? "Edit Idea" : "New Idea"}
              {hasChanges && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                />
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4" onKeyDown={handleKeyPress}>
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Textarea
                placeholder="✨ Write your thoughts here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`min-h-[140px] resize-none border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20 leading-relaxed placeholder:text-gray-400 ${
                  errors.content ? "border-red-300 focus:border-red-400" : ""
                }`}
                autoFocus
              />
              <AnimatePresence>
                {errors.content && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-1 mt-1 text-xs text-red-600"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.content}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {content.length}/5000 characters
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end gap-2 pt-2"
            >
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSaving}
                className="border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
              >
                Cancel
              </Button>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={
                    !content.trim() ||
                    isSaving ||
                    Object.keys(errors).length > 0
                  }
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-sm min-w-[80px] text-white"
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {hasChanges ? "Save Changes" : "Save"}
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>

            {/* Keyboard shortcut hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-gray-600 text-center bg-indigo-50/50 p-2 rounded-lg"
            >
              💡 Tip: Press Ctrl+Enter to save • Esc to cancel
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
