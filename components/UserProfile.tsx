import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  Settings,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { database } from "@/lib/database";
import { useNotesStore } from "@/lib/store";

interface UserProfileProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function UserProfile({
  showLabel = true,
  size = "md",
}: UserProfileProps) {
  const { logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { loadNotes } = useNotesStore();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      await database.clearAllNotes();
      await loadNotes();
    } catch (error) {
      // Silent fail
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getAvatarSize = () => {
    switch (size) {
      case "sm":
        return "h-6 w-6";
      case "lg":
        return "h-10 w-10";
      default:
        return "h-8 w-8";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "lg":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  // Default display name for anonymous user
  const displayName = "Anonymous";
  const avatarUrl = null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 p-2 hover:bg-gray-100 ${
            size === "sm" ? "h-8" : size === "lg" ? "h-12" : "h-10"
          }`}
          aria-label="Account"
        >
          {/* Avatar */}
          <div
            className={`${getAvatarSize()} rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center overflow-hidden`}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User
                className={`${size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} text-white`}
              />
            )}
          </div>
          {/* Hide text label for minimal UI */}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <span className="font-medium truncate max-w-[120px]">
              {displayName}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Minimal avatar-only component
export function UserAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return <UserProfile showLabel={false} size={size} />;
}
