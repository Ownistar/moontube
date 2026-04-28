import { useEffect } from 'react';

const POPUNDER_KEY = 'moontube_popunder_last_shown';
const CLICK_COUNT_KEY = 'moontube_session_clicks';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export default function PopUnder() {
  useEffect(() => {
    const now = Date.now();
    const lastShown = localStorage.getItem(POPUNDER_KEY);
    
    // STRICT FREQUENCY CAP: If shown in last 24 hours, don't even add listeners
    if (lastShown && (now - parseInt(lastShown)) < TWENTY_FOUR_HOURS) {
      return;
    }

    let lastEventTime = 0;

    const handleInteraction = () => {
      const currentTime = Date.now();
      
      // Basic debounce to prevent double-counting touch+click as two interactions
      if (currentTime - lastEventTime < 200) return;
      lastEventTime = currentTime;

      // Re-check frequency cap just in case (e.g. two tabs open)
      const freshLastShown = localStorage.getItem(POPUNDER_KEY);
      if (freshLastShown && (currentTime - parseInt(freshLastShown)) < TWENTY_FOUR_HOURS) {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        return;
      }

      // Track interaction count within the session
      const currentClicks = parseInt(sessionStorage.getItem(CLICK_COUNT_KEY) || '0');
      const newClicks = currentClicks + 1;
      sessionStorage.setItem(CLICK_COUNT_KEY, newClicks.toString());

      // Trigger sequence
      if (newClicks === 1) {
        // Load the script after the FIRST interaction so it's ready for the SECOND
        const script = document.createElement('script');
        script.src = 'https://accedelid.com/f3/5f/d8/f35fd8f3c65fc113ce4deba181806518.js';
        script.async = true;
        document.head.appendChild(script);
      } else if (newClicks >= 2) {
        // On the SECOND interaction (or later if script was slow), we mark it as shown
        localStorage.setItem(POPUNDER_KEY, currentTime.toString());
        
        // Remove listener immediately after firing to strictly enforce one-time trigger
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      }
    };

    // Listen for both click and touchstart for mobile optimization
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return null;
}
