import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun, Settings } from 'lucide-react';

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { name: 'Portal', path: '/' },
    { name: 'Knowledge', path: '/knowledge' },
    { name: 'Asia2EU', path: '/asia2eu' },
  ];

  return (
    <header className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-3xl glass rounded-full px-6 py-3 flex items-center justify-between pointer-events-auto">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <Link to="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
              G
            </div>
            <span>Gary Li</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-slate-300" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
          
          {/* Admin panel link */}
          <Link
            to="/admin"
            className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            aria-label="Admin Panel"
            title="Admin Panel"
          >
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
        </div>
        
      </div>
    </header>
  );
}
