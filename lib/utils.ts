import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 生成唯一的idea_flash_id
export function generateIdeaFlashId(userId?: string): string {
  const timestamp = Date.now();
  const userIdPart = userId || "anonymous";
  return `${timestamp}_${userIdPart}`;
}
