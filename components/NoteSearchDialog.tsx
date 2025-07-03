import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { NoteEditor } from "./NoteEditor";
import { NoteCard } from "./NoteCard";
import { Note } from "@/lib/database";
import { useNotesStore } from "@/lib/store";

interface NoteSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEditNote: (note: Note) => void;
}

export function NoteSearchDialog({
  isOpen,
  onClose,
  onEditNote,
}: NoteSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "title" | "content">(
    "recent"
  );

  const { notes, loadNotes, deleteNote } = useNotesStore();

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      loadNotes().finally(() => setIsLoading(false));
    }
  }, [isOpen, loadNotes]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedTag(null);
    }
  }, [isOpen]);

  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([tag]) => tag);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let filtered = notes.filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = !selectedTag || note.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });

    // Sort results
    switch (sortBy) {
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "content":
        filtered.sort((a, b) => a.content.length - b.content.length);
        break;
      case "recent":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return filtered;
  }, [notes, searchQuery, selectedTag, sortBy]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm("Delete this idea?")) {
        try {
          await deleteNote(id);
        } catch (error) {
          console.error("Failed to delete note:", error);
        }
      }
    },
    [deleteNote]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  const handleSearchInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchQuery("");
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl h-[90vh] max-h-[90vh] p-0 bg-gradient-to-br from-white to-indigo-50/30 flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 border-b border-gray-200 flex-shrink-0"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 font-display">
              <FileText className="h-5 w-5 text-indigo-500" />
              Your Ideas History
              {filteredNotes.length !== notes.length && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filteredNotes.length} of {notes.length}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Search and Filter */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchInputKeyDown}
                className="pl-10 pr-10 border-gray-200 focus:border-indigo-400 placeholder:text-gray-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Tags and Sort */}
            <div className="flex items-center justify-between gap-3">
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 flex-1">
                  <Button
                    variant={selectedTag === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(null)}
                    className="h-7 text-xs"
                  >
                    All
                  </Button>
                  {allTags.slice(0, 6).map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedTag(selectedTag === tag ? null : tag)
                      }
                      className="h-7 text-xs"
                    >
                      #{tag}
                    </Button>
                  ))}
                  {allTags.length > 6 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs opacity-50"
                      disabled
                    >
                      +{allTags.length - 6}
                    </Button>
                  )}
                </div>
              )}

              {/* Sort Options */}
              <div className="flex gap-1">
                <Button
                  variant={sortBy === "recent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("recent")}
                  className="h-7 text-xs"
                >
                  Recent
                </Button>
                <Button
                  variant={sortBy === "title" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("title")}
                  className="h-7 text-xs"
                >
                  A-Z
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-16"
            >
              <div className="text-center text-gray-500">
                <motion.div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-3"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                />
                <p className="text-sm">Loading ideas...</p>
              </div>
            </motion.div>
          ) : filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-4 text-gray-500"
            >
              {searchQuery || selectedTag ? (
                <div>
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No ideas found
                  </h3>
                  <p className="text-sm">
                    Try adjusting your search or filters
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTag(null);
                    }}
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div>
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No ideas yet
                  </h3>
                  <p className="text-sm">Start capturing your thoughts!</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-2 space-y-1.5"
            >
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note, index) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    index={index}
                    onEdit={onEditNote}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between flex-shrink-0"
        >
          <div className="text-xs text-gray-500">
            {filteredNotes.length}{" "}
            {filteredNotes.length === 1 ? "idea" : "ideas"} found
            {searchQuery && (
              <span className="ml-2 font-medium">for "{searchQuery}"</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
