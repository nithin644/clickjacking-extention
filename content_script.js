// content_script.js
(async () => {
  try {
    // Only run for http(s) pages
    if (!location.protocol.startsWith("http")) return;

    // HEAD request to get headers (non-intrusive)
    // Some servers may not support HEAD well; fallback to GET on failure is not done to stay passive.
    let vulnerable = null;
    try {
      const resp = await fetch(window.location.href, {
        method: "HEAD",
        credentials: "include", // include cookies for same-origin if needed
        cache: "no-store"
      });

      // If fetch fails or non-2xx response we will still try to parse headers if available
      const xfo = resp.headers.get("x-frame-options");
      const csp = resp.headers.get("content-security-policy");

      // Simple logic:
      // - If X-Frame-Options exists => protected
      // - If CSP contains frame-ancestors with 'none' or non-wildcard => protected
      // Otherwise => likely vulnerable
      if (xfo) {
        vulnerable = false;
      } else if (csp) {
        const lc = csp.toLowerCase();
        if (lc.includes("frame-ancestors")) {
          // treat presence of frame-ancestors as protection (unless it's wildcard)
          // crude parse:
          const directive = lc.split(";").map(s=>s.trim()).find(d => d.startsWith("frame-ancestors"));
          if (directive && !directive.includes("*")) {
            vulnerable = false;
          } else {
            vulnerable = true;
          }
        } else {
          vulnerable = true;
        }
      } else {
        vulnerable = true;
      }
    } catch (err) {
      // If HEAD failed (CORS or server issues) mark as unknown (null)
      vulnerable = null;
    }

    // Send message to service worker / background with status
    chrome.runtime.sendMessage({
      action: "clickjack_status",
      url: window.location.href,
      vulnerable: vulnerable,
      ts: Date.now()
    });
  } catch (e) {
    // ignore errors quietly
    console.error("Content script error:", e);
  }
})();
