import { twMerge } from 'tailwind-merge';

interface NoDataMessageProps {
  message: string;
  className?: string;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({
  message,
  className,
}) => {
  return (
    <div
      className={twMerge(
        `
          w-full
          mt-4
          p-4
          rounded-full
          bg-grey-custom/50
          text-center
        `,
        className
      )}
    >
      <p>{message}</p>
    </div>
  );
};

export default NoDataMessage;
