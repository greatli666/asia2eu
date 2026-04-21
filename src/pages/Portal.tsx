import { motion } from 'motion/react';
import BioCard from '../components/bento/BioCard';
import StatsCard from '../components/bento/StatsCard';
import SocialCard from '../components/bento/SocialCard';
import SkillsCard from '../components/bento/SkillsCard';
import ProjectsCard from '../components/bento/ProjectsCard';
import KnowledgeCard from '../components/bento/KnowledgeCard';

import type { Variants } from 'motion/react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Portal() {
  return (
    <div className="w-full flex-col flex gap-8">
      <div className="w-full text-center mt-12 mb-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
          <span className="text-slate-400 dark:text-slate-500 font-light text-2xl md:text-3xl block mb-2">Welcome to space,</span> 
          Gary Li
        </h1>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(160px,auto)]"
      >
        <BioCard />
        <StatsCard />
        <SocialCard />
        <SkillsCard />
        <ProjectsCard />
        <KnowledgeCard />
      </motion.div>
    </div>
  );
}
