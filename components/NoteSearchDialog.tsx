import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Clock, SortAsc, SortDesc } from "lucide-react";
import { useNotesStore } from "@/lib/store";
import { Note } from "@/lib/database";
import { NoteCard } from "./NoteCard";

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl mx-auto max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold">
            <Clock className="h-5 w-5" />
            History
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Search and sort controls */}
          <div className="flex gap-2 p-4 border-b flex-shrink-0">
            <div className="relative flex-1">
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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="flex items-center gap-2 text-sm border border-border rounded px-3 py-2 bg-popover"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
            </select>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted" />
                <p className="text-lg font-medium">No notes found</p>
                <p className="text-sm">
                  {searchTerm
                    ? "Try different search terms"
                    : "Create your first note"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
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
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
