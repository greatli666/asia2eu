import CardWrapper from './CardWrapper';
import { MapPin } from 'lucide-react';

export default function BioCard() {
  return (
    <CardWrapper className="md:col-span-2 md:row-span-2 flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-3xl mb-4 font-bold text-blue-600 dark:text-blue-400">
          G
        </div>
        <div className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-200 dark:border-green-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Available
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-2">Gary Li</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
          System engineer, UI/UX enthusiast, and lifelong learner. Building projects that combine premium aesthetics with scalable design. 
        </p>
      </div>
      <div className="flex gap-4 mt-auto">
        <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
          <MapPin size={16} className="text-blue-500" /> Based in Europe
        </div>
      </div>
    </CardWrapper>
  );
}
