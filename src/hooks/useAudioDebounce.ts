import { useRef, useEffect } from 'react';

export const useAudioDebounce = (debounceTime: number = 5000) => {
  const hasNewPendingNotificationRef = useRef<boolean>(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const playAudioDebounced = (audioElement: HTMLAudioElement | undefined) => {
    if (!audioElement) return;

    if (timeoutId.current) return;
    if (!hasNewPendingNotificationRef.current) {
      audioElement?.play();
      hasNewPendingNotificationRef.current = true;
      return;
    }
    timeoutId.current = setTimeout(() => {
      audioElement?.play();
      timeoutId.current = null;
      hasNewPendingNotificationRef.current = false;
    }, debounceTime);
  };

  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return { playAudioDebounced };
};

export default useAudioDebounce;
