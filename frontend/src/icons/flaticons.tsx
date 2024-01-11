import { twMerge } from 'tailwind-merge';

interface SearchIconProps {
  className?: string;
}

export const SearchIcon: React.FC<SearchIconProps> = ({ className }) => {
  return <i className={twMerge('fi fi-rr-search', className)}></i>;
};

interface EditIconProps {
  className?: string;
}

export const EditIcon: React.FC<EditIconProps> = ({ className }) => {
  return <i className={twMerge('fi fi-rr-file-edit', className)}></i>;
};
