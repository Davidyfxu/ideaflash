import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Tag, ExternalLink, Clock } from "lucide-react";
import { Note } from "@/lib/database";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (idea_flash_id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm("Delete this note?")) {
      onDelete(note.idea_flash_id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {note.title || "Untitled"}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(note.created_at)}</span>
            {note.updated_at !== note.created_at && (
              <>
                <Clock className="h-3 w-3" />
                <span>Updated {formatDate(note.updated_at)}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(note)}
            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            aria-label="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
          {note.content}
        </p>
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <Tag className="h-3 w-3 text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600"
              >
                #{tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600"
              >
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Source link */}
      {note.url && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <ExternalLink className="h-3 w-3" />
          <a
            href={note.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:text-blue-600"
            title={note.url}
          >
            {new URL(note.url).hostname}
          </a>
        </div>
      )}
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
