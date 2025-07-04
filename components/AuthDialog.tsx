import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "signin" | "signup";

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const {
    login,
    register,
    setError,
    setLoading,
    isLoading,
    error,
    isApiEnabled,
  } = useAuthStore();

  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // 如果API未配置，不显示认证对话框
  if (!isApiEnabled) {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleEmailAuth = async () => {
    setLoading(true);
    try {
      const { email, password, confirmPassword } = formData;

      if (!email || !password) {
        throw new Error("请填写所有必填字段");
      }

      if (authMode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("密码确认不匹配");
        }
        if (password.length < 6) {
          throw new Error("密码至少需要6个字符");
        }

        await register(email, password);
        onClose();
      } else {
        await login(email, password);
        onClose();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "认证失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    handleEmailAuth();
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
    });
    setError(null);
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {authMode === "signin" && "登录到 IdeaFlash"}
            {authMode === "signup" && "注册 IdeaFlash"}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {authMode === "signin" && "使用邮箱和密码登录"}
            {authMode === "signup" && "创建您的账户"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {/* 邮箱登录表单 */}
          <div className="space-y-3">
            <div>
              <Input
                type="email"
                placeholder="邮箱地址"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="密码"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {authMode === "signup" && (
              <div>
                <Input
                  type="password"
                  placeholder="确认密码"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full"
                />
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {authMode === "signin" ? "登录" : "注册"}
            </Button>
          </div>

          {/* 切换模式 */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {authMode === "signin" ? "还没有账户？" : "已有账户？"}
            </span>
            <Button
              variant="link"
              size="sm"
              onClick={() =>
                switchMode(authMode === "signin" ? "signup" : "signin")
              }
              className="text-blue-600 hover:text-blue-800"
            >
              {authMode === "signin" ? "立即注册" : "立即登录"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
