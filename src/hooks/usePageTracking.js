import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // If Google Tag Manager's dataLayer exists
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'pageview',
        page_path: location.pathname + location.search,
        page_title: document.title
      });
    }
  }, [location]);
}
