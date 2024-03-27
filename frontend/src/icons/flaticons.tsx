import { twMerge } from 'tailwind-merge';

interface FlatIconsProps {
  name: string;
  onClick?: () => void;
  className?: string;
  size?: string;
}

export const FlatIcons: React.FC<FlatIconsProps> = ({
  name,
  onClick,
  className,
  size = 'text-base',
}) => {
  return (
    <i onClick={onClick} className={twMerge(`${name} ${size}`, className)}></i>
  );
};
