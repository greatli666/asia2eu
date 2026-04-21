import { motion } from 'motion/react';
import { ReactNode } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Variants } from 'motion/react';

interface Props {
  children: ReactNode;
  className?: string;
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CardWrapper({ children, className }: Props) {
  return (
    <motion.div
      variants={itemVariants}
      className={twMerge(clsx("glass-card glass-hover overflow-hidden flex flex-col p-6", className))}
    >
      {children}
    </motion.div>
  );
}
