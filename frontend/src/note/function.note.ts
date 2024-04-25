// blog-card-banner.component.tsx

// 1. 顯示固定數量的 tags button，但每次刷新，tags 的類型都會不同
// 2. 希望這些 tags button 在排列的時候可以按照每行 3 個來排列，且 tags button 的寬度是自適應的
// 3. 點擊頭像或用戶名導向到用戶個人頁面

// 進度
// 1. 解決 [ Back to top ] 出現功能，現在的問題是切換 inpageNav 時，back to top 監聽不會更新
// 2. 解決方向 1：在 inpageNav 切換時，觸發 back to top 的監聽更新；解決方向 2：改變監聽的方式(讓它可以即時更新)
