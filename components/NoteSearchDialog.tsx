import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  Clock,
  SortAsc,
  SortDesc,
  ChevronRight,
} from "lucide-react";
import { useNotesStore } from "@/lib/store";
import { Note } from "@/lib/database";
import { NoteCard } from "./NoteCard";
import { motion } from "framer-motion";

interface NoteSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEditNote: (note: Note) => void;
}

type SortOption = "newest" | "oldest" | "title";

export function NoteSearchDialog({
  isOpen,
  onClose,
  onEditNote,
}: NoteSearchDialogProps) {
  const { notes, deleteNote } = useNotesStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Memoized filtered and sorted notes
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title?.toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });
  }, [notes, searchTerm, sortBy]);

  const handleDeleteNote = async (idea_flash_id: string) => {
    try {
      await deleteNote(idea_flash_id);
    } catch (error) {
      // Silent fail
    }
  };

  const clearSearch = () => setSearchTerm("");

  const getSortIcon = () => {
    switch (sortBy) {
      case "newest":
        return <SortDesc className="h-4 w-4" />;
      case "oldest":
        return <SortAsc className="h-4 w-4" />;
      case "title":
        return <Clock className="h-4 w-4" />;
      default:
        return <SortDesc className="h-4 w-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-background border-l border-border shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">History</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-accent"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="p-4 border-b border-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={sortBy === "newest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("newest")}
                  className="flex-1"
                >
                  <SortDesc className="h-4 w-4 mr-2" />
                  Newest
                </Button>
                <Button
                  variant={sortBy === "oldest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("oldest")}
                  className="flex-1"
                >
                  <SortAsc className="h-4 w-4 mr-2" />
                  Oldest
                </Button>
                <Button
                  variant={sortBy === "title" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("title")}
                  className="flex-1"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Title
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredNotes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted" />
                  <p className="text-lg font-medium">No notes found</p>
                  <p className="text-sm">
                    {searchTerm
                      ? "Try different search terms"
                      : "Create your first note"}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <div className="text-sm text-muted-foreground">
                    {filteredNotes.length} note
                    {filteredNotes.length !== 1 ? "s" : ""}
                  </div>
                  <div className="grid gap-3">
                    <AnimatePresence>
                      {filteredNotes.map((note) => (
                        <NoteCard
                          key={note.idea_flash_id}
                          note={note}
                          onEdit={onEditNote}
                          onDelete={handleDeleteNote}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
