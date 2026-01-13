import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useFocusManagement = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollPos = window.scrollY;
    
    const restoreScroll = () => {
      if (window.scrollY !== scrollPos) {
        window.scrollTo(0, scrollPos);
      }
    };

    const timer = setTimeout(restoreScroll, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname]);

  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      (mainContent as HTMLElement).focus();
    }
  }, [location.pathname]);
};