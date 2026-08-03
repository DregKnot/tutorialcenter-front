import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // Fire Google Tag Manager custom pageview event for SPA routing
    // Using setTimeout ensures React Helmet has time to update the document.title
    setTimeout(() => {
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'virtual_pageview',
          page_location: window.location.origin + pathname + search,
          page_title: document.title
        });
      }
    }, 100);
  }, [pathname, search]);

  return null;
}
