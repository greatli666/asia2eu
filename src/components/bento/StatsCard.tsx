import CardWrapper from './CardWrapper';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function StatsCard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-US', {
    timeZone: 'Europe/Paris', // Typical Europe tz, can change it later
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <CardWrapper className="col-span-1 row-span-1 justify-center items-center relative group">
      <div className="absolute top-4 left-4 text-slate-400 transition-colors group-hover:text-blue-500">
        <Clock size={20} />
      </div>
      <div className="text-center mt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Local Time</p>
        <p className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white font-mono">
          {timeString}
        </p>
      </div>
    </CardWrapper>
  );
}
