import { useMemo } from 'react';

export const useWebView = () => {
  const isInWebView = useMemo(() => {
    const ua = window.navigator.userAgent;

    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
    const isIOSWebView = isIOS && !isSafari;

    const isAndroidWebView =
      ua.includes('wv') ||
      (ua.includes('Android') && ua.includes('Version/'));

    return isIOSWebView || isAndroidWebView;
  }, []);

  return isInWebView;
};
