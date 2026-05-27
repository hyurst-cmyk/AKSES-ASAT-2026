import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setAuthenticated: (val: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, logout: () => setAuthenticated(false) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
