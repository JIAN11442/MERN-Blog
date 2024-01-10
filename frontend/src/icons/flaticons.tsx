import { twMerge } from 'tailwind-merge';

interface SearchIconProps {
  className?: string;
}

export const SearchIcon: React.FC<SearchIconProps> = ({ className }) => {
  return <i className={twMerge('fi fi-rr-search', className)}></i>;
};
