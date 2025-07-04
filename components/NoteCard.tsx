import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Note } from "@/lib/database";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  index?: number;
}

export function NoteCard({ note, onEdit, onDelete, index = 0 }: NoteCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onEdit(note);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.2,
        delay: index * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{
        y: -2,
        scale: 1.01,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      className="group bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-2.5 
                 hover:shadow-lg hover:shadow-indigo-100/50 hover:border-indigo-200 
                 transition-all cursor-pointer focus-within:ring-2 focus-within:ring-indigo-400/20
                 focus-within:border-indigo-400"
      onClick={() => onEdit(note)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Edit note: ${note.title || "Untitled"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <motion.h3
          className="font-semibold text-xs text-gray-900 line-clamp-1 flex-1 leading-tight"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
        >
          {note.title || "Untitled"}
        </motion.h3>

        <motion.div
          className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="h-6 w-6 p-0 hover:bg-indigo-100 text-indigo-600"
              aria-label="Edit note"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.idea_flash_id);
              }}
              className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
              aria-label="Delete note"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <motion.p
        className="text-xs text-gray-700 line-clamp-2 mb-2 leading-relaxed"
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
      >
        {note.content}
      </motion.p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <motion.div
          className="flex items-center gap-1 text-xs text-gray-500"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
        >
          <Clock className="h-2.5 w-2.5" />
          <span className="whitespace-nowrap text-xs">
            {formatDistanceToNow(new Date(note.created_at), {
              addSuffix: true,
            })}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Add CSS for line-clamp utility
const styles = `
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
