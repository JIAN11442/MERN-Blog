import { AnimatePresence, motion } from "framer-motion";

interface AnimationWrapperProps {
  ref?: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  keyValue?: string;
  initial: { opacity: number };
  animate: { opacity: number };
  transition: { duration: number; delay?: number };
  exit?: { opacity: number };
  className?: string;
}

const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  ref,
  children,
  keyValue,
  initial,
  animate,
  transition,
  exit,
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
        exit={exit}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationWrapper;
