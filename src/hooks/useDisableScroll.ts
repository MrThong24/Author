import { useEffect } from "react";

/**
 * Hook để tắt/cuộn màn hình khi một thành phần mở lên
 * @param isActive boolean - true: chặn cuộn, false: bật cuộn lại
 */
const useDisableScroll = (isActive: boolean) => {
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive]);
};

export default useDisableScroll;
