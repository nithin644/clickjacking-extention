// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const hostEl = document.getElementById("host");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      statusEl.textContent = "No active tab";
      return;
    }
    const url = tabs[0].url || "";
    let host = "";
    try {
      host = new URL(url).hostname;
    } catch (e) {
      host = url;
    }
    hostEl.textContent = host;

    // Ask background for stored status
    chrome.runtime.sendMessage({ action: "get_status_for_tab", url: url }, (resp) => {
      if (!resp || typeof resp.status === "undefined") {
        statusEl.textContent = "No data yet. Reload the page.";
        statusEl.className = "unknown";
        return;
      }

      const st = resp.status;
      if (st === true) {
        statusEl.textContent = "This site is vulnerable to clickjacking";
        statusEl.className = "vulnerable";
      } else if (st === false) {
        statusEl.textContent = "This site is not vulnerable to clickjacking";
        statusEl.className = "safe";
      } else {
        statusEl.textContent = "No data or unknown";
        statusEl.className = "unknown";
      }
    });
  });
});
