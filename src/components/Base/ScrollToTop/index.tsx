import { useLocation } from "react-router-dom";
import { useEffect } from "react";

function ScrollToTop(): null {
  const location = useLocation();

  useEffect(() => {
    const scrollToTop = (): void => {
      // Since we've disabled body scrollbar via CSS, only reset the working scrollbar
      const sidebarScrollable = document.querySelector('div.w-full.h-full.z-20.px-5.overflow-y-auto.overflow-x-hidden');
      if (sidebarScrollable instanceof HTMLElement) {
        sidebarScrollable.scrollTop = 0;
      }

      // Reset any other main content scrollable areas that might exist
      const mainContentScrollables = document.querySelectorAll('div.overflow-y-auto:not(.w-full.h-full.z-20)');
      mainContentScrollables.forEach((element) => {
        if (element instanceof HTMLElement && !element.closest('table')) {
          element.scrollTop = 0;
        }
      });

      // Reset window scroll as backup (should be prevented by CSS)
      window.scrollTo(0, 0);
    };

    // Immediate scroll reset
    scrollToTop();

    // Additional reset for dynamic content
    const timeoutId = window.setTimeout(scrollToTop, 50);

    return (): void => {
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  return null;
}

export default ScrollToTop;
