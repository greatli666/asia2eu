/**
 * App Root — Router Configuration
 *
 * Wraps the entire app in ThemeProvider (dark/light) and AuthProvider (admin auth).
 * All pages render inside the Layout wrapper (Navbar + Footer).
 *
 * Routes:
 *   /            → Portal (Bento Grid homepage)
 *   /knowledge   → Knowledge Base
 *   /asia2eu     → Original Asia2EU service pages
 *   /admin       → Admin dashboard (password-protected)
 *   *            → Redirect to /
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Portal from './pages/Portal';
import Asia2EU from './pages/Asia2EU';
import Knowledge from './pages/Knowledge';
import Admin from './pages/Admin';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Portal />} />
              <Route path="knowledge/*" element={<Knowledge />} />
              <Route path="asia2eu/*" element={<Asia2EU />} />
              <Route path="admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
