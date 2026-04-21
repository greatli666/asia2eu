import CardWrapper from './CardWrapper';
import { Mail, Github, Linkedin, MessageCircle } from 'lucide-react';

export default function SocialCard() {
  const links = [
    { icon: <Mail size={18} />, href: "mailto:contact@gary.li" },
    { icon: <Github size={18} />, href: "#" },
    { icon: <MessageCircle size={18} />, href: "#", label: "WeChat" }
  ];

  return (
    <CardWrapper className="col-span-1 row-span-1 flex-col justify-between">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Connect</h3>
      <div className="flex gap-3 justify-between mt-auto">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.href}
            title={link.label}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition-colors"
          >
            {link.icon}
          </a>
        ))}
      </div>
    </CardWrapper>
  );
}
