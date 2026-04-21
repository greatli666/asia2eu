import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout Wrapper
 * Responsibilities:
 * - Render Navbar globally
 * - Provide the main container max-width and padding
 * - Render children/Outlet pages below the Navbar
 * - Render Footer globally
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <Navbar />
      {/* 
        Add top padding to main content to account for the fixed Navbar.
        Using flex-grow to push footer to bottom. 
      */}
      <main className="flex-grow w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
