export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full mt-auto py-8 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-black/5 dark:border-white/5">
      <p>© {currentYear} Gary Li. All Rights Reserved.</p>
    </footer>
  );
}
