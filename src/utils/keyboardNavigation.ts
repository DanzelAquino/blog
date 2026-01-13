export const setupKeyboardNavigation = () => {
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      return;
    }
    
    if (e.key === 'Tab' && !e.altKey) {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
};