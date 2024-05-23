**刪除留言的邏輯（方法一）**
**問題：儘管有使用 async/await，且有 then，但還是會在執行完前就 return deleteCount，**

```ts
const deleteCommentFunc = async ({
  commentObjectId,
  deleteNum,
}: deleteFuncPropsType) => {
  let deleteCount = deleteNum;

  // 找到該留言後刪除，所以要用 findOneAndDelete
  await CommentSchema.findOneAndDelete({ _id: commentObjectId }).then(
    (comment) => {
      deleteCount += 1;

      // 如果是回覆留言，記得要回到被回覆留言的 children 中刪除該回覆留言的 objectId
      if (comment?.parent) {
        CommentSchema.findOneAndUpdate(
          { _id: comment.parent },
          { $pull: { children: commentObjectId } }
        )
          .then(() => {
            deleteCount += 1;
            console.log('delete parent comment children successfully');
          })
          .catch((error) => console.log(error));
      }

      // 當然不管是頭留言還是回覆留言，都要刪除該留言的通知
      NotificationSchema.findOneAndDelete({ comment: commentObjectId })
        .then(() => console.log('delete comment notification successfully'))
        .catch((error) => console.log(error));

      // 與 notification 一樣，
      // 不管是頭留言還是回覆留言，都要更新 blog 的 comments 及 activity 資料
      // 更新後，如果該留言有 children，就要遞迴刪除該留言的 children
      // 這樣才能完全刪除該留言及其所有子留言
      BlogSchema.findOneAndUpdate(
        { _id: comment?.blog_id },
        {
          $pull: { comments: commentObjectId },
          $inc: {
            'activity.total_comments': -1,
            'activity.total_parent_comments': comment?.parent ? 0 : -1,
          },
        }
      )
        .then(() => {
          if (comment?.children.length) {
            comment.children.map((replies) =>
              deleteCommentFunc({
                commentObjectId: replies.toString(),
                deleteNum: deleteCount,
              })
            );
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  );

  return deleteCount;
};
```

<!-- -------------------------------------------------- -->

**刪除留言的邏輯（方法二）**
**問題：使用 map 來遞迴刪除子留言，雖然成功刪除，但順序不對，似乎會同步執行**
**理想情況： 3-2-4-1**
**實際情況： 4-3-2-1**

```ts
const deleteCommentFunc = async ({
  commentObjectId,
  deleteNum,
}: deleteFuncPropsType) => {
  let deleteCount = deleteNum;

  try {
    // 找到該留言
    const comment = await CommentSchema.findOne({ _id: commentObjectId });

    // 如果找不到該留言，自然就不能刪除，就回傳錯誤
    if (!comment) {
      throw createHttpError(404, 'Comment not found');
    }

    // 如果該留言有 children，就要先遞迴刪除該留言的所有 children
    // 直到抓到最後一層 children 並刪除完畢後，才會回到上一層 children 接著刪除
    // 等所有 children 都刪除完後，最後才會刪除頭留言
    if (comment?.children.length) {
      // 使用 Promise.all 確保所有子評論都被刪除後再繼續
      await Promise.all(
        comment.children.map(async (replies) => {
          // 刪除的同時也要累加返回的 deleteCount，給下一個遞歸使用
          const childDeleteCount = await deleteCommentFunc({
            commentObjectId: replies.toString(),
            deleteNum: 0,
          });
          deleteCount += childDeleteCount;
        })
      );
    }

    // 如果是回覆留言
    if (comment?.parent) {
      // 先確認是否有該 parent comment
      const parentComment = await CommentSchema.findOne({
        _id: comment.parent,
      });

      if (!parentComment) {
        throw createHttpError(404, 'Parent comment not found');
      }

      // 記得要回到被回覆留言的 children 中刪除該回覆留言的 objectId
      const updateParentComment = await CommentSchema.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: commentObjectId } },
        { new: true }
      );

      if (!updateParentComment) {
        throw createHttpError(500, 'Failed to delete parent comment children');
      }
    }

    // 當然不管是頭留言還是回覆留言，都要刪除該留言的通知
    const deleteNotification = await NotificationSchema.findOneAndDelete({
      comment: commentObjectId,
    });

    // 如果刪除通知失敗，就回傳錯誤
    if (!deleteNotification) {
      throw createHttpError(500, 'Failed to delete comment notification');
    }

    // 與 notification 一樣，
    // 不管是頭留言還是回覆留言，都要更新 blog 的 comments 及 activity 資料
    // 更新後，如果該留言有 children，就要遞迴刪除該留言的 children
    // 這樣才能完全刪除該留言及其所有子留言
    const updateBlogInfo = await BlogSchema.findOneAndUpdate(
      { _id: comment?.blog_id },
      {
        $pull: { comments: commentObjectId },
        $inc: {
          'activity.total_comments': -1,
          'activity.total_parent_comments': comment?.parent ? 0 : -1,
        },
      }
    );

    // 如果更新 blog 資料失敗，就回傳錯誤
    if (!updateBlogInfo) {
      throw createHttpError(
        500,
        'Failed to update blog comments info and activity info'
      );
    }

    // 最後刪除該留言
    const deleteComment = await CommentSchema.findOneAndDelete({
      _id: commentObjectId,
    });

    // 如果刪除留言失敗，就回傳錯誤
    if (!deleteComment) {
      throw createHttpError(500, 'Failed to delete comment');
    }

    console.log(deleteComment.comment);

    // 反之，如果找到該留言並成功刪除，就要增加 deleteCount
    // 方便後續回傳給前端知道刪除了幾筆留言
    deleteCount += 1;

    console.log(deleteCount, deleteComment.comment);
  } catch (error) {
    console.log(error);
  }

  return deleteCount;
};
```

<!-- -------------------------------------------------- -->

**刪除留言的邏輯（方法三）**
**問題：使用 for...of 來遞迴刪除子留言，雖然能成功刪除，但 eslint 不支持，會報錯**

```ts
const deleteCommentFunc = async ({
  commentObjectId,
  deleteNum,
}: deleteFuncPropsType) => {
  let deleteCount = deleteNum;

  try {
    // 找到該留言
    const comment = await CommentSchema.findOne({ _id: commentObjectId });

    // 如果找不到該留言，自然就不能刪除，就回傳錯誤
    if (!comment) {
      throw createHttpError(404, 'Comment not found');
    }

    // 如果該留言有 children，就要先遞迴刪除該留言的所有 children
    // 直到抓到最後一層 children 並刪除完畢後，才會回到上一層 children 接著刪除
    // 等所有 children 都刪除完後，最後才會刪除頭留言
    if (comment?.children.length) {
      for (const replies of comment.children) {
        const childDeleteCount = await deleteCommentFunc({
          commentObjectId: replies.toString(),
          deleteNum: 0,
        });
        deleteCount += childDeleteCount;
      }
    }

    // 如果是回覆留言
    if (comment?.parent) {
      // 先確認是否有該 parent comment
      const parentComment = await CommentSchema.findOne({
        _id: comment.parent,
      });

      if (!parentComment) {
        throw createHttpError(404, 'Parent comment not found');
      }

      // 記得要回到被回覆留言的 children 中刪除該回覆留言的 objectId
      const updateParentComment = await CommentSchema.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: commentObjectId } },
        { new: true }
      );

      if (!updateParentComment) {
        throw createHttpError(500, 'Failed to delete parent comment children');
      }
    }

    // 當然不管是頭留言還是回覆留言，都要刪除該留言的通知
    const deleteNotification = await NotificationSchema.findOneAndDelete({
      comment: commentObjectId,
    });

    // 如果刪除通知失敗，就回傳錯誤
    if (!deleteNotification) {
      throw createHttpError(500, 'Failed to delete comment notification');
    }

    // 與 notification 一樣，
    // 不管是頭留言還是回覆留言，都要更新 blog 的 comments 及 activity 資料
    // 更新後，如果該留言有 children，就要遞迴刪除該留言的 children
    // 這樣才能完全刪除該留言及其所有子留言
    const updateBlogInfo = await BlogSchema.findOneAndUpdate(
      { _id: comment?.blog_id },
      {
        $pull: { comments: commentObjectId },
        $inc: {
          'activity.total_comments': -1,
          'activity.total_parent_comments': comment?.parent ? 0 : -1,
        },
      }
    );

    // 如果更新 blog 資料失敗，就回傳錯誤
    if (!updateBlogInfo) {
      throw createHttpError(
        500,
        'Failed to update blog comments info and activity info'
      );
    }

    // 最後刪除該留言
    const deleteComment = await CommentSchema.findOneAndDelete({
      _id: commentObjectId,
    });

    // 如果刪除留言失敗，就回傳錯誤
    if (!deleteComment) {
      throw createHttpError(500, 'Failed to delete comment');
    }

    console.log(deleteComment.comment);

    // 反之，如果找到該留言並成功刪除，就要增加 deleteCount
    // 方便後續回傳給前端知道刪除了幾筆留言
    deleteCount += 1;

    console.log(deleteCount, deleteComment.comment);
  } catch (error) {
    console.log(error);
  }

  return deleteCount;
};
```

<!-- -------------------------------------------------- -->

**刪除留言的邏輯（方法四）**
**問題：使用 reduce 來遞迴刪除子留言，雖然能成功刪除，但邏輯上好像會鎖死**
**比如 Inside 2 進入 result，需要等下一個遞歸的 Inside 3 完成 Promise 才會執行，但 Inside 3 卡在 acc，也需要 Inside 2 完成 Promise 才會接著執行**

```ts
const deleteCommentFunc = async ({
  commentObjectId,
  deleteNum,
}: deleteFuncPropsType) => {
  let deleteCount = deleteNum;

  try {
    // 找到該留言
    const comment = await CommentSchema.findOne({ _id: commentObjectId });

    // 如果找不到該留言，自然就不能刪除，就回傳錯誤
    if (!comment) {
      throw createHttpError(404, 'Comment not found');
    }

    // 如果該留言有 children，就要先遞迴刪除該留言的所有 children
    // 直到抓到最後一層 children 並刪除完畢後，才會回到上一層 children 接著刪除
    // 等所有 children 都刪除完後，最後才會刪除頭留言
    if (comment?.children.length) {

      deleteCount = await comment.children.reduce(async (accPromise, childId) => {
        const acc = await accPromise;
        const result = await deleteCommentFunc({ commentObjectId: childId.toString(), deleteNum: acc });
        return result;
      }, Promise.resolve(deleteCount));

    // 如果是回覆留言
    if (comment?.parent) {
      // 先確認是否有該 parent comment
      const parentComment = await CommentSchema.findOne({
        _id: comment.parent,
      });

      if (!parentComment) {
        throw createHttpError(404, 'Parent comment not found');
      }

      // 記得要回到被回覆留言的 children 中刪除該回覆留言的 objectId
      const updateParentComment = await CommentSchema.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: commentObjectId } },
        { new: true }
      );

      if (!updateParentComment) {
        throw createHttpError(500, 'Failed to delete parent comment children');
      }
    }

    // 當然不管是頭留言還是回覆留言，都要刪除該留言的通知
    const deleteNotification = await NotificationSchema.findOneAndDelete({
      comment: commentObjectId,
    });

    // 如果刪除通知失敗，就回傳錯誤
    if (!deleteNotification) {
      throw createHttpError(500, 'Failed to delete comment notification');
    }

    // 與 notification 一樣，
    // 不管是頭留言還是回覆留言，都要更新 blog 的 comments 及 activity 資料
    // 更新後，如果該留言有 children，就要遞迴刪除該留言的 children
    // 這樣才能完全刪除該留言及其所有子留言
    const updateBlogInfo = await BlogSchema.findOneAndUpdate(
      { _id: comment?.blog_id },
      {
        $pull: { comments: commentObjectId },
        $inc: {
          'activity.total_comments': -1,
          'activity.total_parent_comments': comment?.parent ? 0 : -1,
        },
      }
    );

    // 如果更新 blog 資料失敗，就回傳錯誤
    if (!updateBlogInfo) {
      throw createHttpError(
        500,
        'Failed to update blog comments info and activity info'
      );
    }

    // 最後刪除該留言
    const deleteComment = await CommentSchema.findOneAndDelete({
      _id: commentObjectId,
    });

    // 如果刪除留言失敗，就回傳錯誤
    if (!deleteComment) {
      throw createHttpError(500, 'Failed to delete comment');
    }

    console.log(deleteComment.comment);

    // 反之，如果找到該留言並成功刪除，就要增加 deleteCount
    // 方便後續回傳給前端知道刪除了幾筆留言
    deleteCount += 1;

    console.log(deleteCount, deleteComment.comment);
  } catch (error) {
    console.log(error);
  }

  return deleteCount;
};
```
