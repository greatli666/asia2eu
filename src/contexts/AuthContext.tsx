/**
 * AuthContext — Global authentication state for the Admin panel.
 *
 * Stores the admin password in memory (never persisted) and exposes
 * `isAuthed` / `login` / `logout` to any consuming component.
 * The Navbar uses `isAuthed` to highlight the admin gear icon,
 * and the Admin page uses `token` to authenticate API requests.
 */
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface AuthState {
  isAuthed: boolean;
  token: string;
  login: (password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  isAuthed: false,
  token: '',
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState('');

  const login = useCallback((password: string) => {
    setToken(password);
  }, []);

  const logout = useCallback(() => {
    setToken('');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthed: !!token, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
