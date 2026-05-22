import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/stores/auth";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/ResetPasswordPage";
import { OAuthCallbackPage } from "@/features/auth/OAuthCallbackPage";
import { ChatShell } from "@/features/chat/ChatShell";

const ProtectedRoute = () => {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const GuestOnlyRoute = () => {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    element: <GuestOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/oauth/callback/:provider", element: <OAuthCallbackPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/", element: <ChatShell /> }],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
