import CardWrapper from './CardWrapper';
import { FolderGit2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectsCard() {
  return (
    <CardWrapper className="md:col-span-2 row-span-2 justify-between group flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderGit2 size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Showcase</h3>
        </div>
        <Link to="/asia2eu" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group/link">
          <ArrowUpRight size={16} className="text-slate-500 group-hover/link:text-blue-500" />
        </Link>
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        <Link to="/asia2eu" className="block p-4 rounded-xl bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 border border-blue-100/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors">
          <div className="font-bold text-lg text-slate-800 dark:text-white mb-2 flex items-center justify-between">
            Asia2EU API
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Real-time data service deployed on Cloudflare Workers edge network.
          </p>
          <div className="flex gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">CF Workers</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">React</span>
          </div>
        </Link>
      </div>
    </CardWrapper>
  );
}
