/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { initCrossTabAuthSync, updateSessionId, destroyCrossTabAuthSync } from "@/utils/crossTabAuthSync";

interface AuthContextType {
  userRole: string | null;
  setUserRole: (role: string | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const userData = localStorage.getItem("userData");
  const accessToken = localStorage.getItem("accessToken");
  const userSession = localStorage.getItem("userSession");
  const parsedData = userData ? JSON.parse(userData) : null;
  const role = parsedData?.designation;
  const [userRole, setUserRole] = useState<string | null>(role || null);
  const [token, setToken] = useState<string | null>(accessToken || null);

  // Initialize cross-tab auth sync when component mounts
  useEffect(() => {
    // Initialize the cross-tab authentication sync
    initCrossTabAuthSync();
    
    // Update session ID if it exists
    if (userSession) {
      updateSessionId(userSession);
    }
    
    // Cleanup when component unmounts
    return () => {
      destroyCrossTabAuthSync();
    };
  }, [userSession]);

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
