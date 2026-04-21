import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import Portal from './pages/Portal';
import Asia2EU from './pages/Asia2EU';
import Knowledge from './pages/Knowledge';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Portal />} />
            <Route path="knowledge/*" element={<Knowledge />} />
            <Route path="asia2eu/*" element={<Asia2EU />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
