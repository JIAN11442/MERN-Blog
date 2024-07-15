/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

interface InpageNavigationProps {
  routes: string[];
  inPageNavIndex: number;
  setInPageNavIndex: React.Dispatch<React.SetStateAction<number>>;
  defaultHiddenIndex?: number;
  initialActiveIndex?: number;
  adaptiveAdjustment?: { initialToFirstTab: boolean };
  children: React.ReactNode;
  className?: string;
}

export let activeButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
export let activeTabLineRef: React.MutableRefObject<HTMLHRElement | null>;

const InpageNavigation: React.FC<InpageNavigationProps> = ({
  routes,
  inPageNavIndex,
  setInPageNavIndex,
  defaultHiddenIndex,
  initialActiveIndex = 0,
  adaptiveAdjustment = { initialToFirstTab: false },
  children,
  className,
}) => {
  activeButtonRef = useRef<HTMLButtonElement>(null);
  activeTabLineRef = useRef<HTMLHRElement>(null);

  const changePageState = (btn: HTMLButtonElement, i: number) => {
    // 取得當前 Button 的寬度和左側位置
    const { offsetWidth, offsetLeft } = btn;

    // 將綫條移動到當前 Button 的位置(設定 hr 的 left 和 width 屬性)
    if (activeTabLineRef.current) {
      activeTabLineRef.current.style.width = `${offsetWidth}px`;
      activeTabLineRef.current.style.left = `${offsetLeft}px`;
    }

    setInPageNavIndex(i);
  };

  // 因為我們已經設定 activeButtonRef 只會在第一個 Button 上，
  // 所以我們可以在這裡藉由 changePageState() 來初始化當前 Button 的狀態
  useEffect(() => {
    if (activeButtonRef.current) {
      changePageState(activeButtonRef.current, initialActiveIndex);
    }
  }, []);

  // 這是一個選擇性功能，
  // 為了讓頁簽在遊覽器突然變大時，能自動切換到第一個頁簽上
  useEffect(() => {
    if (adaptiveAdjustment) {
      const handleResize = () => {
        // 如果當前頁面是 md-screen，即大於等於 768px，
        // 且 inPageNavIndex > 0，即不在第一個頁簽上

        let target;

        if (window.innerWidth >= 768) {
          if (adaptiveAdjustment.initialToFirstTab) {
            target = document.getElementById(routes[0]);
          } else {
            target = document.getElementById(routes[inPageNavIndex]);
          }

          // 則自動切換到第一個頁簽上
          target?.click();
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [adaptiveAdjustment, inPageNavIndex]);

  return (
    <>
      {/* Bookmark */}
      <div
        className={twMerge(
          `
          relative
          flex
          flex-nowrap
          mb-8
          border-b
          border-grey-custom
          bg-white-custom
          overflow-hidden
          `,
          className
        )}
      >
        {/* 頁簽切換 Button */}
        {routes.map((route, i) => {
          return (
            // 首先這裡有幾個很關鍵的點要注意：(初始化 hr 線的位置和長度)
            // 1. 為了讓 hr 線能在一開始就顯示在第一個 Button 上，我們需要用 useEffect 啟用 changePageState()來指定 hr 的長度和位置
            // 2. 而 hr 的 left 和 width 屬性是根據當前 Button 的 offsetLeft 和 offsetWidth 來設定的
            // 3. 因此我們需要藉由 ref 來取得當前 Button 的 offsetLeft 和 offsetWidth
            // 4. 但是因為我們的 button 是經過 map 生成的，所以如果直接在 Button 上設定 ref，會導致回傳的 ref 總會是最後一個 Button 的 ref
            // 5. 這樣就會導致 hr 的 left 和 width 屬性會錯誤，所以我們需要在 Button 上設定 ref={i === defaultActiveIndex ? activeButtonRef : null}
            // 6. 這樣就可以確保 ref 只會在第一個 Button 上，並且在 useEffect 中可以正確取得當前 Button 的 offsetLeft 和 offsetWidth，並以此來設定 hr 的 left 和 width
            // 7. 這樣就可以確保 hr 線會在一開始就顯示在第一個 Button 上

            // 接著是關於手動點擊 Button 時 hr 線的移動：
            // 1. 當 Button 被點擊時，我們同樣需要先取得當前 Button 的 offsetLeft 和 offsetWidth，並以此傳遞給 changePageState() 來設定 hr 的 left 和 width
            // 2. 但取得的方法與初始化不太一樣，初始化是透過 ref 取得，而這裡是透過 e.target 來取得當前 Button 的 offsetLeft 和 offsetWidth
            // 3. 原因是上述提到的 ref 的問題(map -> 總會是最後一個)，且我們已經強制設定 ref 只會在第一個 Button 上
            // 4. 所以這時候如果我們還是透過 ref 來取得當前 Button 的 offsetLeft 和 offsetWidth，就會導致點擊第一個 Button 是正確的，但點擊其他 Button 時會出現錯誤（因為點擊其他 Button，ref 會是 null）
            // 5. 所以這裡我們透過 e.target 來取得當前 Button 的 offsetLeft 和 offsetWidth，並以此來設定 hr 的 left 和 width

            // 總結：
            // 1. 初始化 hr 線的位置和長度，透過 ref 來取得第一個 Button 的 offsetLeft 和 offsetWidth
            // 2. 手動點擊 Button 時，透過 e.target 來取得當前 Button 的 offsetLeft 和 offsetWidth

            // 關鍵概念：
            // 1. 當 Button 是透過 map 生成時，這時候的 ref 總會是最後一個 Button 的 ref，這可能會導致我們取得的 offsetLeft 和 offsetWidth 會是錯誤的
            // 2. 因此可以知道，ref 與 e.target 還是有差異的，ref 是在初始化時取得，而 e.target 是在點擊時取得
            // 3. 前者在 map 時會有問題，後者則不會
            <button
              id={route}
              ref={i === initialActiveIndex ? activeButtonRef : null}
              key={i}
              onClick={(e) => changePageState(e.target as HTMLButtonElement, i)}
              className={`
                p-4
                px-5
                capitalize
                ${
                  i === inPageNavIndex
                    ? "text-black-custom"
                    : "text-grey-dark/50"
                }
                ${i === defaultHiddenIndex && "md:hidden"}
                transition
              `}
            >
              {route}
            </button>
          );
        })}

        {/* 當前切換 Button 下標綫 - 以分隔綫的方式呈現 */}
        <hr
          id="inpage-nav-line"
          ref={activeTabLineRef}
          className={`
            absolute
            bottom-0
            duration-300
            border-black-custom
            ${inPageNavIndex === defaultHiddenIndex && "md:hidden"}
          `}
        />
      </div>

      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InpageNavigation;
