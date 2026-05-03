import { useEffect } from 'react';

const POPUNDER_KEY = 'mpp_pu_last_shown';
const CLICK_COUNT_KEY = 'mpp_pu_clicks';
const INJECTED_THIS_SESSION = 'mpp_pu_injected';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const TRIGGER_CLICK_COUNT = 2;

export default function PopUnder() {
  useEffect(() => {
    let lastEventTime = 0;

    const handleInteraction = () => {
      const currentTime = Date.now();
      
      // Basic debounce to prevent double-counting touch+click as two interactions
      if (currentTime - lastEventTime < 300) return;
      lastEventTime = currentTime;

      // Check 24-hour frequency cap first
      const lastShown = localStorage.getItem(POPUNDER_KEY);
      if (lastShown && (currentTime - parseInt(lastShown)) < TWENTY_FOUR_HOURS) {
        return;
      }

      // Check if we already injected it in this session to prevent multiple firings
      if (sessionStorage.getItem(INJECTED_THIS_SESSION)) {
        return;
      }

      // Increment click count (persisted for unique user logic)
      const currentClicks = parseInt(localStorage.getItem(CLICK_COUNT_KEY) || '0');
      const newClicks = currentClicks + 1;
      localStorage.setItem(CLICK_COUNT_KEY, newClicks.toString());

      // Trigger sequence: Load and arm on the 2nd click
      if (newClicks >= TRIGGER_CLICK_COUNT) {
        // Mark as shown for the next 24 hours immediately
        localStorage.setItem(POPUNDER_KEY, currentTime.toString());
        // Reset clicks for the next cycle
        localStorage.setItem(CLICK_COUNT_KEY, '0');
        // Flag this session as "armed and fired"
        sessionStorage.setItem(INJECTED_THIS_SESSION, 'true');

        // Check if script already exists to avoid redundant tags
        if (!document.querySelector('script[src*="f35fd8f3c65fc113ce4deba181806518"]')) {
          const script = document.createElement('script');
          script.src = 'https://accedelid.com/f3/5f/d8/f35fd8f3c65fc113ce4deba181806518.js';
          script.async = true;
          document.head.appendChild(script);
        }
        
        // Remove our own listeners immediately to stop counting/processing
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      }
    };

    // Safety check: if already shown in 24h or already done this session, don't even attach listeners
    const lastShown = localStorage.getItem(POPUNDER_KEY);
    const currentTime = Date.now();
    if (
      (lastShown && (currentTime - parseInt(lastShown)) < TWENTY_FOUR_HOURS) ||
      sessionStorage.getItem(INJECTED_THIS_SESSION)
    ) {
      return;
    }

    document.addEventListener('click', handleInteraction, { passive: true });
    document.addEventListener('touchstart', handleInteraction, { passive: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return null;
}
