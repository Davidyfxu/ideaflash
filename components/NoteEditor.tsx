import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Loader2 } from "lucide-react";
import { useNotesStore } from "@/lib/store";
import { Note } from "@/lib/database";

interface NoteEditorProps {
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteEditor({ note, isOpen, onClose }: NoteEditorProps) {
  const { addNote, updateNote, error } = useNotesStore();
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [saving, setSaving] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(note?.title || "");
      setContent(note?.content || "");
      setSaving(false);
    }
  }, [isOpen, note]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      if (note) {
        await updateNote(note.idea_flash_id, {
          title: title.trim(),
          content: content.trim(),
        });
      } else {
        await addNote({
          title: title.trim(),
          content: content.trim(),
        });
      }
      onClose();
    } catch (e) {
      // Silent fail
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      void handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onKeyDown={handleKeyPress}
    >
      <div className="bg-popover rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title input */}
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-3 text-lg font-semibold border-border focus:border-ring focus:ring-ring/20 placeholder:text-muted-foreground"
        />

        {/* Content textarea */}
        <Textarea
          ref={contentRef}
          placeholder="Write something..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[160px] resize-none border-border focus:border-ring focus:ring-ring/20 leading-relaxed placeholder:text-muted-foreground"
          autoFocus
        />

        {/* Error message */}
        {error && <div className="mt-3 text-xs text-destructive">{error}</div>}

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
              Ctrl
            </kbd>
            <span className="mx-1">+</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
              Enter
            </kbd>
            <span className="ml-1">to save</span>
          </div>
          <Button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="gradient-primary hover:opacity-90 text-white shadow-lg hover:shadow-xl px-6 transition-all duration-300"
            size="sm"
            aria-label="Save"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
