/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import BlogEditor from "../components/blog-editor.component";
import PublishEditor from "../components/publish-editor.component";
import Loader from "../components/loader.component";

import useAuthStore from "../states/user-auth.state";
import useEditorBlogStore from "../states/blog-editor.state";

import useBlogFetch from "../fetchs/blog.fetch";

const BlogEditorPage = () => {
  const { blogId } = useParams();
  const { authUser } = useAuthStore();
  const { editorState } = useEditorBlogStore();
  const { GetTargetBlogInfo } = useBlogFetch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 如果是編輯模式的話，就應該會從 useParams 中取得 blogId
    // 但假設沒有，就代表當前是創建模式
    // 這時候就不需要 loading
    if (!blogId) {
      return setLoading(false);
    }

    // 如果是編輯模式，就利用 blogId 來取得目標 blog 的資訊
    // 同時 controller 應該要不纍加 total_reads
    // 因爲目前是編輯狀態下讀取目標 blog，不應該影響到 total_reads
    GetTargetBlogInfo({ blogId, draft: true, mode: "edit" });
    setLoading(false);
  }, [blogId]);

  return (
    <>
      {!authUser?.access_token ? (
        <Navigate to="/signin" />
      ) : editorState === "editor" ? (
        loading ? (
          <Loader
            loader={{ speed: 1, size: 50 }}
            className={{ container: "mt-5" }}
          />
        ) : (
          <BlogEditor />
        )
      ) : (
        <PublishEditor />
      )}
    </>
  );
};

export default BlogEditorPage;
