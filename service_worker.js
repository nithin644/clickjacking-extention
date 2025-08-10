// service_worker.js
const siteStatus = {}; // runtime cache

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  // clear storage on install/update (optional)
  // chrome.storage.local.clear();
});

// Receive messages from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.action !== "clickjack_status") return;

  const host = hostnameFromUrl(msg.url);
  if (!host) return;

  // msg.vulnerable: true = vuln, false = protected, null = unknown
  siteStatus[host] = msg.vulnerable;

  // persist result
  chrome.storage.local.set({ [host]: msg.vulnerable });

  // If vulnerable (explicit true), notify and open popup for the tab
  if (msg.vulnerable === true) {
    // Desktop notification
    chrome.notifications.create(`cj-vuln-${host}-${Date.now()}`, {
      type: "basic",
      iconUrl: "icon48.png",
      title: "Clickjacking Alert",
      message: `${host} may be vulnerable to clickjacking (no X-Frame-Options or CSP frame-ancestors).`
    }, () => {});

    // Attempt to open the popup for the tab where message originated
    // Note: openPopup opens the extension's popup for the active tab in the window where called.
    // We first try to make sender.tab active and focused, then open popup.
    if (sender && sender.tab && sender.tab.id) {
      const tabId = sender.tab.id;
      // focus the tab's window and make tab active
      chrome.tabs.update(tabId, { active: true }, () => {
        // then open popup (may be subject to browser behavior/policy)
        try {
          chrome.action.openPopup();
        } catch (e) {
          // openPopup might throw in some contexts; ignore gracefully
          console.warn("openPopup failed:", e);
        }
      });
    } else {
      // fallback: just try to open popup (will affect current active tab)
      try { chrome.action.openPopup(); } catch (e) {}
    }
  }

  // If not vulnerable or unknown we do nothing here (popup will display status when opened)
});

// Optional: respond to popup requests for current tab status
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === "get_status_for_tab") {
    const host = hostnameFromUrl(msg.url);
    chrome.storage.local.get(host, (res) => {
      sendResponse({ host, status: res[host] });
    });
    // indicate we'll send response asynchronously
    return true;
  }
});
