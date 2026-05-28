// @refresh reset
import { createContext, useContext, useState, ReactNode } from "react";

const SESSION_KEY = "tg_auth";
const LOGIN_TIME_KEY = "tg_login_ts";

interface AuthContextType {
  isAuthenticated: boolean;
  loginTime: number | null;
  setAuthenticated: (val: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthState] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });

  const [loginTime, setLoginTimeState] = useState<number | null>(() => {
    try {
      const stored = sessionStorage.getItem(LOGIN_TIME_KEY);
      return stored ? Number(stored) : null;
    } catch {
      return null;
    }
  });

  const setAuthenticated = (val: boolean) => {
    try {
      if (val) {
        const now = Date.now();
        sessionStorage.setItem(SESSION_KEY, "1");
        sessionStorage.setItem(LOGIN_TIME_KEY, String(now));
        setLoginTimeState(now);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(LOGIN_TIME_KEY);
        setLoginTimeState(null);
      }
    } catch {
      // sessionStorage unavailable (private mode, etc.)
    }
    setAuthState(val);
  };

  const logout = () => setAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loginTime, setAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
