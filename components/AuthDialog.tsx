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
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
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

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Hide dialog if API is not configured
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
        throw new Error("Please fill in all required fields.");
      }

      if (authMode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        await register(email, password);
        onClose();
      } else {
        await login(email, password);
        onClose();
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Authentication failed."
      );
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
            {authMode === "signin" && "Sign in to IdeaFlash"}
            {authMode === "signup" && "Create an IdeaFlash Account"}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {authMode === "signin" && "Sign in with your email and password."}
            {authMode === "signup" && "Create your account to get started."}
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

          {/* Email sign in/up form */}
          <div className="space-y-3">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                  placeholder="Confirm password"
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
              {authMode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
          </div>

          {/* Switch mode */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {authMode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>
            <Button
              variant="link"
              size="sm"
              onClick={() =>
                switchMode(authMode === "signin" ? "signup" : "signin")
              }
              className="text-blue-600 hover:text-blue-800"
            >
              {authMode === "signin" ? "Sign up now" : "Sign in now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
