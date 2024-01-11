import { twMerge } from 'tailwind-merge';

interface FlatIconsProps {
  name: string;
  onClick?: () => void;
  className?: string;
}

export const FlatIcons: React.FC<FlatIconsProps> = ({
  name,
  onClick,
  className,
}) => {
  return <i onClick={onClick} className={twMerge(`${name}`, className)}></i>;
};
