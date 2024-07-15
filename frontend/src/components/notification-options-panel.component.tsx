import AnimationWrapper from "./page-animation.component";
import useDashboardStore from "../states/dashboard.state";
import useDashboardFetch from "../fetchs/dashboard.fetch";

const NotificationOptionsPanel = () => {
  const { setIsMarked } = useDashboardStore();
  const { UpdateNotificationSeenStateByUser } = useDashboardFetch();

  const handleMarkSeen = (markAsRead: boolean) => {
    UpdateNotificationSeenStateByUser({ seen: markAsRead });

    setIsMarked(true);
  };

  return (
    <AnimationWrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="
        absolute
        top-0
        right-5
        z-20
        shadow-[0px_0px_5px_1px]
        shadow-grey-dark/15
        rounded-md
      "
    >
      <div
        className="
          flex
          flex-col
          w-[125px]
          border
          border-grey-custom
          bg-white-custom
          rounded-md
          duration-200
        "
      >
        <button onClick={() => handleMarkSeen(true)} className="link flex">
          Mark as read
        </button>

        <button onClick={() => handleMarkSeen(false)} className="link flex">
          Mark as unread
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default NotificationOptionsPanel;
