import { useEffect } from 'react';

const POPUNDER_KEY = 'mpp_pu_last_shown';
const CLICK_COUNT_KEY = 'mpp_pu_clicks';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const TRIGGER_CLICK_COUNT = 6;

export default function PopUnder() {
  useEffect(() => {
    let lastEventTime = 0;

    const handleInteraction = () => {
      const currentTime = Date.now();
      
      // Basic debounce
      if (currentTime - lastEventTime < 300) return;
      lastEventTime = currentTime;

      // Check 24-hour frequency cap
      const lastShown = localStorage.getItem(POPUNDER_KEY);
      if (lastShown && (currentTime - parseInt(lastShown)) < TWENTY_FOUR_HOURS) {
        return;
      }

      // Increment click count (using localStorage for "unique user" persistence)
      const currentClicks = parseInt(localStorage.getItem(CLICK_COUNT_KEY) || '0');
      const newClicks = currentClicks + 1;
      localStorage.setItem(CLICK_COUNT_KEY, newClicks.toString());

      // Trigger sequence
      // Load script on the 5th click so it's ready for the 6th interaction
      if (newClicks === TRIGGER_CLICK_COUNT - 1) {
        const script = document.createElement('script');
        script.src = 'https://accedelid.com/f3/5f/d8/f35fd8f3c65fc113ce4deba181806518.js';
        script.async = true;
        document.head.appendChild(script);
      } 
      
      // On the 6th click, we consider it "fired" for the 24h frequency cap
      if (newClicks === TRIGGER_CLICK_COUNT) {
        localStorage.setItem(POPUNDER_KEY, currentTime.toString());
        // Reset clicks for the next 24 hour period
        localStorage.setItem(CLICK_COUNT_KEY, '0');
        
        // Remove listener for this cycle
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      }
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return null;
}
