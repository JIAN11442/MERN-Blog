import { AnimatePresence, motion } from 'framer-motion';

interface AniamationWrapperProps {
  ref?: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  keyValue?: string;
  initial: { opacity: number };
  animate: { opacity: number };
  transition: { duration: number; delay?: number };
  className?: string;
}

const AniamationWrapper: React.FC<AniamationWrapperProps> = ({
  ref,
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
        ref={ref}
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
