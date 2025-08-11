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

      // Improved logic:
      // - X-Frame-Options: DENY or SAMEORIGIN => protected
      // - CSP: frame-ancestors 'none' or specific domains (not *) => protected
      // - Otherwise => unknown if no headers, vulnerable if explicitly allowed
      if (xfo) {
        const xfoVal = xfo.trim().toUpperCase();
        if (xfoVal === "DENY" || xfoVal === "SAMEORIGIN") {
          vulnerable = false;
        } else {
          vulnerable = true;
        }
      } else if (csp) {
        const lc = csp.toLowerCase();
        if (lc.includes("frame-ancestors")) {
          // Parse frame-ancestors directive
          const directive = lc.split(";").map(s=>s.trim()).find(d => d.startsWith("frame-ancestors"));
          if (directive) {
            // Get values after frame-ancestors
            const values = directive.replace("frame-ancestors","").trim().split(/\s+/);
            if (values.includes("'none'")) {
              vulnerable = false;
            } else if (values.includes("*")) {
              vulnerable = true;
            } else if (values.length > 0) {
              // Specific domains listed, treat as protected
              vulnerable = false;
            } else {
              vulnerable = null;
            }
          } else {
            vulnerable = null;
          }
        } else {
          vulnerable = true;
        }
      } else {
        vulnerable = null;
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
