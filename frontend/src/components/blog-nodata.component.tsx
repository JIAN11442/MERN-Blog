interface NoDataMessageProps {
  message: string;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({ message }) => {
  return (
    <div
      className="
        w-full
        mt-4
        p-4
        rounded-full
        bg-grey-custom/50
        text-center
    "
    >
      <p>{message}</p>
    </div>
  );
};

export default NoDataMessage;
