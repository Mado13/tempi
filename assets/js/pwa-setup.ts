// Create a new file: js/pwa-setup.ts
export function setupPWA() {
  // Register service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error);
        });
    });
  }

  // Add manifest link if not already present
  if (!document.querySelector('link[rel="manifest"]')) {
    const linkElement = document.createElement("link");
    linkElement.rel = "manifest";
    linkElement.href = "/manifest.webmanifest";
    document.head.appendChild(linkElement);
  }

  return {
    checkForUpdates() {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      }
    },
  };
}
