import { createContext } from "react";

// 扩展AuthContext类型以支持用户角色和ID
interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userId: string | null;
  userName: string | null;
  setAuth: (userId: string, role: string, name?: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  userId: null,
  userName: null,
  setAuth: () => {},
  logout: () => {},
  clearAuth: () => {},
});