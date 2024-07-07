/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import BlogEditor from "../components/blog-editor.component";
import PublishEditor from "../components/publish-editor.component";
import Loader from "../components/loader.component";

import useAuthStore from "../states/user-auth.state";
import useEditorBlogStore, { initialBlog } from "../states/blog-editor.state";

import useBlogFetch from "../fetchs/blog.fetch";

const BlogEditorPage = () => {
  const { blogId } = useParams();
  const { authUser } = useAuthStore();
  const { editorState, editorBlog, initialEditBlog } = useEditorBlogStore();
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

    return () => {
      initialEditBlog();
    };
  }, [blogId]);

  return (
    <>
      {/* 如果還沒登錄，移動至登錄頁面 */}
      {!authUser?.access_token ? (
        <Navigate to="/signin" />
      ) : // 如果 editorState 是 editor 模式，那就有兩種可能(編輯模式或創建模式)
      editorState === "editor" ? (
        // 如果有 blogId，那就代表當前是編輯模式(我們只希望編輯模式要有 Loader 緩衝)
        // 且如果 editorBlog 還是初始化狀態，代表還沒獲取目標 blogId 的資訊
        // 那就顯示 Loader
        blogId && editorBlog === initialBlog ? (
          <Loader className={{ container: "mt-5" }} />
        ) : (
          // 如果 editorState 是 editor 模式，但沒有 blogId，
          // 那就代筆當前是創建模式，正常顯示空的 BlogEditor 即可
          <BlogEditor />
        )
      ) : (
        // 如果 editorState 是 publish 模式，
        // 就顯示 PublishEditor
        <PublishEditor />
      )}
    </>
  );
};

export default BlogEditorPage;
