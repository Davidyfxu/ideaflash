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
import { Badge } from "@/components/ui/badge";
import {
  User,
  LogOut,
  Settings,
  Mail,
  Phone,
  Crown,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

interface UserProfileProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function UserProfile({
  showLabel = true,
  size = "md",
}: UserProfileProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 如果未认证，不显示组件
  if (!isAuthenticated || !user) {
    return null;
  }

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

  // 获取用户显示名称
  const displayName = user.full_name || user.email?.split("@")[0] || "用户";

  // 获取头像
  const avatarUrl = user.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 p-2 hover:bg-gray-100 ${
            size === "sm" ? "h-8" : size === "lg" ? "h-12" : "h-10"
          }`}
        >
          {/* 用户头像 */}
          <div
            className={`${getAvatarSize()} rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden`}
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

          {/* 用户名称（可选显示） */}
          {showLabel && (
            <span
              className={`${getTextSize()} font-medium text-gray-700 max-w-24 truncate`}
            >
              {displayName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{displayName}</span>
              <Badge variant="outline" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              {user.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>账户设置</span>
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
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 简化版用户头像组件
export function UserAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return <UserProfile showLabel={false} size={size} />;
}
