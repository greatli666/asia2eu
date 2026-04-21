import CardWrapper from './CardWrapper';
import { Terminal } from 'lucide-react';

export default function SkillsCard() {
  const skills = [
    "TypeScript", "React", "Cloudflare Workers", 
    "Python", "Tailwind", "Next.js"
  ];

  return (
    <CardWrapper className="md:col-span-2 row-span-1 flex-col justify-between group">
      <div className="flex items-center gap-2 mb-4">
        <Terminal size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tech Stack</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span 
            key={skill}
            className="px-3 py-1 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors cursor-default"
          >
            {skill}
          </span>
        ))}
      </div>
    </CardWrapper>
  );
}
