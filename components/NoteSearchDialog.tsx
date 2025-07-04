import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Filter } from "lucide-react";
import { useNotesStore } from "@/lib/store";
import { Note } from "@/lib/database";
import { NoteCard } from "./NoteCard";

interface NoteSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEditNote: (note: Note) => void;
}

type SortOption = "newest" | "oldest" | "title" | "content";
type FilterOption = "all" | "recent" | "tagged";

export function NoteSearchDialog({
  isOpen,
  onClose,
  onEditNote,
}: NoteSearchDialogProps) {
  const { notes, deleteNote, searchNotes, clearFilters, error } =
    useNotesStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  // Filter and sort notes
  useEffect(() => {
    let filtered = [...notes];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title?.toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term)
      );
    }

    // Apply time filter
    switch (filterBy) {
      case "recent":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(
          (note) => new Date(note.created_at) > oneWeekAgo
        );
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "title":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "content":
        filtered.sort((a, b) => a.content.localeCompare(b.content));
        break;
    }

    setFilteredNotes(filtered);
  }, [notes, searchTerm, sortBy, filterBy, selectedTags]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    searchNotes(value);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    setFilterBy("all");
    setSelectedTags([]);
    clearFilters();
  };

  const handleDeleteNote = async (idea_flash_id: string) => {
    try {
      await deleteNote(idea_flash_id);
    } catch (error) {
      // Silent fail
    }
  };

  const hasActiveFilters =
    searchTerm || filterBy !== "all" || selectedTags.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl mx-auto max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-center text-xl font-bold">
            Search Notes
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Find and manage your ideas
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Search and filters */}
          <div className="space-y-4 p-4 border-b flex-shrink-0">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-gray-500" />

              {/* Time filter */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All time</option>
                <option value="recent">Last 7 days</option>
                <option value="tagged">Tagged only</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">By title</option>
                <option value="content">By content</option>
              </select>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No notes found</p>
                <p className="text-sm">
                  {searchTerm
                    ? "Try adjusting your search terms or filters"
                    : "Create your first note to get started"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  {filteredNotes.length} note
                  {filteredNotes.length !== 1 ? "s" : ""} found
                </div>
                <div className="grid gap-4">
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
