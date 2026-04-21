import CardWrapper from './CardWrapper';
import { BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://asia2eu.lizhilianggreat.workers.dev';

interface BasicArticle {
  title: string;
  date: string;
}

export default function KnowledgeCard() {
  const [latestSnippets, setLatestSnippets] = useState<BasicArticle[]>([
    { title: "React 19 Server Components Architecture", date: "Apr 21" },
    { title: "Glassmorphism in Tailwind CSS v4", date: "Apr 20" },
    { title: "Deploying Python AI on Local Machines", date: "Apr 15" }
  ]);

  useEffect(() => {
    fetch(`${WORKER_URL}/api/knowledge`)
      .then(res => res.json())
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const formatted = data.slice(0, 3).map(a => ({
            title: a.title,
            date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }));
          setLatestSnippets(formatted);
        }
      })
      .catch(e => console.error("Failed to load knowledge snippets", e));
  }, []);

  return (
    <CardWrapper className="md:col-span-2 row-span-2 flex-col group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Knowledge Feed</h3>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full">
          <Sparkles size={12} /> Hot
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {latestSnippets.map((item, i) => (
          <Link key={i} to="/knowledge" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group/item">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 line-clamp-1">
              {item.title}
            </span>
            <span className="text-xs text-slate-400 flex-shrink-0 ml-4">
              {item.date}
            </span>
          </Link>
        ))}
      </div>
      
      <Link to="/knowledge" className="mt-auto text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline pt-4">
        Explore Knowledge Base 
      </Link>
    </CardWrapper>
  );
}
