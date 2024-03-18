import axios from 'axios';

export const uploadImage = async (img: File) => {
  let imgUrl = null;

  // 先發送 GET 請求取得預先簽名的 URL
  await axios
    .get(import.meta.env.VITE_SERVER_DOMAIN + '/aws/get-upload-url')
    .then(async ({ data: { uploadURL } }) => {
      // 拿到預先簽名的 URL 後，再發送 PUT 請求上傳圖片
      await fetch(uploadURL, {
        method: 'PUT',
        body: img,
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(() => {
        // 上傳成功後，取得圖片的 URL
        imgUrl = uploadURL.split('?')[0];
      });
    });

  return imgUrl;
};
