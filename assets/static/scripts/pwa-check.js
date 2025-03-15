document.addEventListener('DOMContentLoaded', function() {
  // Function to set cookie
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  // Function to check if cookie exists
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Main PWA detection function
  function detectPWA() {
    // If we already detected installation, don't redirect
    if (getCookie('pwaInstalled')) {
      return;
    }

    // Check if in standalone mode (installed PWA)
    const isInStandaloneMode = () => 
      (window.matchMedia('(display-mode: standalone)').matches) || 
      (window.navigator.standalone) || 
      document.referrer.includes('android-app://');

    // Check for iOS "Add to Home Screen"
    const isIOSPWA = () => 
      ('standalone' in window.navigator) && 
      (window.navigator.standalone);

    // Is the website being loaded from installed PWA context?
    if (isInStandaloneMode() || isIOSPWA()) {
      // PWA detected - set cookie valid for 30 days
      setCookie('pwaInstalled', 'true', 30);
      console.log('PWA detected and cookie set');
    } else {
      // Not a PWA - redirect to install page
      if (window.location.pathname !== '/install') {
        window.location.href = '/install';
      }
    }
  }

  // Run detection
  detectPWA();

  // Additional listener for display mode changes
  window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
    if (evt.matches) {
      setCookie('pwaInstalled', 'true', 30);
      console.log('Display mode changed to standalone - PWA installed');
    }
  });
});
