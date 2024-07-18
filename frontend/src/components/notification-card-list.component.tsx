import Loader from "./loader.component";
import NoDataMessage from "./blog-nodata.component";
import LoadOptions from "./load-options.component";
import NotificationCard from "./notification-card.component";
import AnimationWrapper from "./page-animation.component";

import {
  GenerateToLoadStructureType,
  LoadFunctionPropsType,
  NotificationStructureType,
} from "../commons/types.common";

interface NotificationCardListProps {
  id: string;
  data: GenerateToLoadStructureType;
  loadFunction: (props: LoadFunctionPropsType) => void;
}

const NotificationCardList: React.FC<NotificationCardListProps> = ({
  id,
  data,
  loadFunction,
}) => {
  return (
    <>
      {/* Notification List */}
      <>
        {data === null ? (
          <Loader />
        ) : (
          <>
            {data && "results" in data && data?.results?.length ? (
              <>
                {data.results.map((item: NotificationStructureType, i) => (
                  <AnimationWrapper
                    key={i}
                    keyValue="notification-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <NotificationCard index={i} data={item} />
                  </AnimationWrapper>
                ))}
              </>
            ) : (
              <NoDataMessage message="Nothing available" />
            )}
          </>
        )}
      </>

      {/* Load Options */}
      <>
        {data !== null ? (
          <LoadOptions
            id={id}
            data={data}
            loadLimit={import.meta.env.VITE_NOTIFICATIONS_LIMIT}
            loadFunction={loadFunction}
          />
        ) : (
          ""
        )}
      </>
    </>
  );
};

export default NotificationCardList;
