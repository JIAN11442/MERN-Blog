import { AnimatePresence, motion } from 'framer-motion';

interface AniamationWrapperProps {
  children: React.ReactNode;
  keyValue?: string;
  initial: { opacity: number };
  animate: { opacity: number };
  transition: { duration: number };
  className?: string;
}

const AniamationWrapper: React.FC<AniamationWrapperProps> = ({
  children,
  keyValue,
  initial,
  animate,
  transition,
  className,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        key={keyValue}
        initial={initial}
        animate={animate}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AniamationWrapper;
