import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useUserFetch from '../fetchs/user.fetch';
import useAuthorProfileStore from '../states/author-profile.state';

const AuthorProfilePage = () => {
  const { authorId } = useParams();
  const { GetAuthorProfileInfo } = useUserFetch();
  const { authorProfile } = useAuthorProfileStore();

  useEffect(() => {
    if (authorId) {
      GetAuthorProfileInfo(authorId);
    }
  }, [authorId]);

  return <h1>{authorProfile?.personal_info.fullname}</h1>;
};

export default AuthorProfilePage;
