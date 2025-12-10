import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();

  // If user is already logged in, redirect to dashboard or other page
  if (token) {
    return <Navigate to="/auth/dashboard" />;
  }
  // Otherwise, render the login page
  return <>{children}</>;
};

export default LoginRoute;
