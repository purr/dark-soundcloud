// ==UserScript==
// @name         Modern Design and Dark Theme for SoundCloud
// @version      0.30.8
// @description  A modern design and dark theme for SoundCloud.com, inspired by the SoundCloud Android app.
// @author       purr
// @namespace    https://github.com/purr/dark-soundcloud
// @homepage     https://github.com/purr/dark-soundcloud
// @supportURL   https://github.com/purr/dark-soundcloud/issues
// @updateURL    https://github.com/purr/dark-soundcloud/raw/main/dark-soundcloud.user.js
// @downloadURL  https://github.com/purr/dark-soundcloud/raw/main/dark-soundcloud.user.js
// @match        *://soundcloud.com/*
// @match        *://*.soundcloud.com/*
// @grant        GM_addStyle
// @run-at       document-start
// @license      MIT
// @resource     FONT_500 https://github.com/purr/dark-soundcloud/raw/main/fonts/soundcloud-sans-500.woff2
// @resource     FONT_700 https://github.com/purr/dark-soundcloud/raw/main/fonts/soundcloud-sans-700.woff2
// @resource     FONT_900 https://github.com/purr/dark-soundcloud/raw/main/fonts/soundcloud-sans-900.woff2
// @resource     CSS https://github.com/purr/dark-soundcloud/raw/main/dark-soundcloud.css
// @grant        GM_getResourceURL
// @grant        GM_getResourceText
// @icon         https://www.soundcloud.com/favicon.ico
// ==/UserScript==

(function () {
  "use strict";

  // Performance optimization: Store selectors as constants to avoid recreating them
  const SELECTORS = {
    MENUS: ".m-light, .m-dark",
    SIDEBAR_TITLE:
      ".sidebarHeader__actualTitle, .sidebarHeader__actualTitle__webi__style",
    REFRESH_TEXT: ".sidebarHeader__more__webi_style",
    ARTIST_USERNAME: ".artistShortcutTile__username",
    BACKGROUND_LIGHT: ".sc-background-light, .sc-background-white",
    TEXT_LIGHT: ".sc-text-light, .sc-text-secondary, .sc-text-base",
    UNWANTED_IFRAMES:
      '.webiEmbeddedModuleIframe[title="Artist tools"], .webiEmbeddedModuleIframe[title="Track insights"], .webiEmbeddedModule',
    STYLE_ENFORCED:
      '[style-enforced="true"], [bg-fixed="true"], [text-fixed="true"]',
    HIDDEN_ELEMENTS: '[sc-dark-hidden="true"]',
  };

  // Track if CSS has been loaded - set to false initially
  let cssLoaded = false;

  // Track if we need to force reload CSS
  const forceReloadCSS = true; // Set to true to force reload on every page load

  // Track last URL for SPA navigation detection
  let lastUrl = location.href;

  // Store timeouts to clear them when needed
  let pendingTimeouts = [];

  // Makes a SoundCloud menu dark using the built-in styles
  function setMenuDarkMode(node) {
    if (!node || !node.classList) return;
    node.classList.remove("m-light");
    node.classList.add("m-dark");
  }

  // Function to remove unwanted iframes (Artist Tools and Track Insights)
  function removeUnwantedIframes() {
    const iframes = document.querySelectorAll(SELECTORS.UNWANTED_IFRAMES);

    if (!iframes || iframes.length === 0) return;

    iframes.forEach((iframe) => {
      try {
        // Try to find and hide the parent container too
        let parent = iframe.parentElement;
        while (
          parent &&
          !parent.classList.contains("sidebarModule") &&
          parent !== document.body
        ) {
          parent = parent.parentElement;
        }

        if (parent && parent.classList.contains("sidebarModule")) {
          // Hide instead of removing
          parent.style.setProperty("display", "none", "important");
          parent.setAttribute("sc-dark-hidden", "true");
        } else {
          // Hide instead of removing
          iframe.style.setProperty("display", "none", "important");
          iframe.setAttribute("sc-dark-hidden", "true");
        }
      } catch (e) {
        // Silent catch - if we can't hide it, just continue
      }
    });
  }

  // Function to enforce styles with improved performance
  function enforceStyles() {
    // Ensure the root element has the dark mode class
    if (
      document.documentElement &&
      !document.documentElement.classList.contains("jtc-sc-dark")
    ) {
      document.documentElement.classList.add("jtc-sc-dark");
    }

    // Apply dark mode to all menus
    document.querySelectorAll(SELECTORS.MENUS).forEach(setMenuDarkMode);

    // Apply styles to specific elements using a more efficient approach
    applyStylesToElements(SELECTORS.SIDEBAR_TITLE, {
      color: "#ffffff",
      textShadow: "none",
      webkitTextFillColor: "#ffffff",
    });

    applyStylesToElements(SELECTORS.REFRESH_TEXT, {
      color: "#a0a0a0",
      textShadow: "none",
      webkitTextFillColor: "#a0a0a0",
    });

    applyStylesToElements(SELECTORS.ARTIST_USERNAME, {
      color: "#f0f0f0",
      textShadow: "none",
      webkitTextFillColor: "#f0f0f0",
    });

    // Fix background colors
    document.querySelectorAll(SELECTORS.BACKGROUND_LIGHT).forEach((element) => {
      if (element && !element.hasAttribute("bg-fixed")) {
        element.classList.remove("sc-background-light");
        element.classList.remove("sc-background-white");
        element.style.setProperty(
          "background-color",
          "var(--jtc-sc-bg)",
          "important"
        );
        element.style.setProperty(
          "background",
          "var(--jtc-sc-bg)",
          "important"
        );
        element.setAttribute("bg-fixed", "true");
      }
    });

    // Fix text colors
    document.querySelectorAll(SELECTORS.TEXT_LIGHT).forEach((element) => {
      if (element && !element.hasAttribute("text-fixed")) {
        element.style.setProperty(
          "color",
          "var(--jtc-sc-light-text)",
          "important"
        );
        element.setAttribute("text-fixed", "true");
      }
    });

    // Ensure hidden elements stay hidden
    document.querySelectorAll(SELECTORS.HIDDEN_ELEMENTS).forEach((element) => {
      element.style.setProperty("display", "none", "important");
    });

    // Set placeholder color for textfields
    if (!document.getElementById("sc-dark-placeholders")) {
      const style = document.createElement("style");
      style.id = "sc-dark-placeholders";
      style.textContent = `
        .textfield__input.sc-input.sc-input-medium::placeholder,
        input.textfield__input.sc-input.sc-input-medium::placeholder { 
          color: #bdbdbd !important; 
          opacity: 1 !important; 
        }
        .textfield__input.sc-input.sc-input-medium::-webkit-input-placeholder,
        .textfield__input.sc-input.sc-input-medium::-moz-placeholder,
        .textfield__input.sc-input.sc-input-medium::-ms-input-placeholder { 
          color: #bdbdbd !important; 
          opacity: 1 !important; 
        }
      `;
      (document.head || document.body).appendChild(style);
    }

    // Force comment body text color on all children
    enforceCommentTextColor();

    // Enforce username link styling
    enforceUsernameLinks();

    // Apply super aggressive fixes for comment input text and reply buttons
    enforceCommentFormTextColor();
    enforceReplyButtonStyles();

    // Hide unwanted iframes
    removeUnwantedIframes();

    // Set a timer to continuously apply our nuclear option fixes
    // This ensures that our styles are always enforced, even if other scripts try to override them
    if (!window.nucleaFixesInterval) {
      window.nucleaFixesInterval = setInterval(() => {
        enforceCommentFormTextColor();
        enforceReplyButtonStyles();
      }, 2000); // Check every 2 seconds
    }
  }

  // Function to enforce styling on username links in comments
  function enforceUsernameLinks() {
    try {
      // Find all username links in comments
      const usernameLinks = document.querySelectorAll(
        ".commentItem__usernameLink"
      );

      if (!usernameLinks.length) return;

      // Create a style element to handle pseudo-classes if it doesn't exist
      if (!document.getElementById("sc-dark-username-links-style")) {
        const style = document.createElement("style");
        style.id = "sc-dark-username-links-style";
        style.textContent = `
          /* Target all pseudo-states of username links */
          .commentItem__usernameLink,
          .commentItem__usernameLink:hover,
          .commentItem__usernameLink:visited,
          .commentItem__usernameLink:link,
          .commentItem__usernameLink:active,
          a.commentItem__usernameLink,
          a.commentItem__usernameLink:hover,
          a.commentItem__usernameLink:visited,
          a.commentItem__usernameLink:link,
          a.commentItem__usernameLink:active,
          .commentItem__usernameLink.sc-link-primary,
          .commentItem__usernameLink.sc-link-primary:hover,
          .commentItem__usernameLink.sc-link-primary:visited,
          .commentItem__usernameLink.sc-link-primary:link,
          .commentItem__usernameLink.sc-link-primary:active {
            color: var(--jtc-sc-root-text) !important;
            text-shadow: none !important;
            -webkit-text-fill-color: var(--jtc-sc-root-text) !important;
            text-decoration: none !important;
            background-color: var(--jtc-sc-border) !important;
            padding: 2px 4px !important;
            border-radius: 3px !important;
            transition: opacity 0.2s ease-in-out !important;
          }

          /* Specific styles for hover state only */
          .commentItem__usernameLink:hover,
          a.commentItem__usernameLink:hover,
          .commentItem__usernameLink.sc-link-primary:hover {
            opacity: 0.85 !important;
            text-decoration: none !important;
          }
        `;
        (document.head || document.body).appendChild(style);
      }

      usernameLinks.forEach((link) => {
        if (!link.hasAttribute("username-link-fixed")) {
          // Apply inline styles for additional specificity
          link.style.setProperty(
            "color",
            "var(--jtc-sc-root-text)",
            "important"
          );
          link.style.setProperty("text-shadow", "none", "important");
          link.style.setProperty(
            "-webkit-text-fill-color",
            "var(--jtc-sc-root-text)",
            "important"
          );
          link.style.setProperty(
            "background-color",
            "var(--jtc-sc-border)",
            "important"
          );
          link.style.setProperty("text-decoration", "none", "important");
          link.style.setProperty("padding", "2px 4px", "important");
          link.style.setProperty("border-radius", "3px", "important");
          link.style.setProperty(
            "transition",
            "opacity 0.2s ease-in-out",
            "important"
          );

          // Mark as fixed
          link.setAttribute("username-link-fixed", "true");

          // Add hover event listeners
          link.addEventListener("mouseenter", function () {
            this.style.setProperty("opacity", "0.85", "important");
            this.style.setProperty("text-decoration", "none", "important");
          });

          link.addEventListener("mouseleave", function () {
            this.style.setProperty("opacity", "1", "important");
            this.style.setProperty("text-decoration", "none", "important");
          });
        }
      });
    } catch (e) {
      // Silent catch - if we can't style username links, continue with other operations
    }
  }

  // New function to enforce text color on all comment body elements and their children
  function enforceCommentTextColor() {
    try {
      // Find all comment body elements
      const commentBodies = document.querySelectorAll(".commentItem__body");

      if (!commentBodies.length) return;

      commentBodies.forEach((commentBody) => {
        // Set proper color on the comment body itself
        if (!commentBody.hasAttribute("text-color-fixed")) {
          commentBody.style.setProperty(
            "color",
            "var(--jtc-sc-root-text)",
            "important"
          );
          commentBody.style.setProperty("text-shadow", "none", "important");
          commentBody.style.setProperty(
            "-webkit-text-fill-color",
            "var(--jtc-sc-root-text)",
            "important"
          );
          commentBody.setAttribute("text-color-fixed", "true");
        }

        // Find and force color on all child elements
        const childElements = commentBody.querySelectorAll("*");
        childElements.forEach((element) => {
          if (!element.hasAttribute("text-color-fixed")) {
            element.style.setProperty(
              "color",
              "var(--jtc-sc-root-text)",
              "important"
            );
            element.style.setProperty("text-shadow", "none", "important");
            element.style.setProperty(
              "-webkit-text-fill-color",
              "var(--jtc-sc-root-text)",
              "important"
            );
            element.setAttribute("text-color-fixed", "true");
          }
        });
      });
    } catch (e) {
      // Silent catch - if we can't enforce comment text color, continue with other operations
    }
  }

  // Helper function to apply styles to elements more efficiently
  function applyStylesToElements(selector, styles) {
    document.querySelectorAll(selector).forEach((element) => {
      if (element && !element.hasAttribute("style-enforced")) {
        for (const [property, value] of Object.entries(styles)) {
          // Convert camelCase to kebab-case for CSS properties
          const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase();
          element.style.setProperty(cssProperty, value, "important");
        }
        element.setAttribute("style-enforced", "true");
      }
    });
  }

  // Function to apply dark mode
  function applyDarkMode() {
    if (document.documentElement) {
      document.documentElement.classList.add("jtc-sc-dark");
      document.querySelectorAll(SELECTORS.MENUS).forEach(setMenuDarkMode);
    }
  }

  // Load fonts with error handling - only load once
  function loadFonts() {
    if (typeof FontFace === "undefined" || !document.fonts) return;

    try {
      // Define font weights and URLs
      const fontWeights = [
        { weight: "500", resource: "FONT_500" },
        { weight: "700", resource: "FONT_700" },
        { weight: "900", resource: "FONT_900" },
      ];

      // Load each font
      fontWeights.forEach(({ weight, resource }) => {
        try {
          let url;

          // Try to use GM_getResourceURL if available
          if (typeof GM_getResourceURL !== "undefined") {
            try {
              url = GM_getResourceURL(resource);
            } catch (e) {
              url = `https://github.com/purr/dark-soundcloud/raw/main/fonts/soundcloud-sans-${weight}.woff2`;
            }
          } else {
            url = `https://github.com/purr/dark-soundcloud/raw/main/fonts/soundcloud-sans-${weight}.woff2`;
          }

          const fontFace = new FontFace("SoundCloudSans", `url(${url})`, {
            style: "normal",
            stretch: "normal",
            weight: weight,
          });

          fontFace
            .load()
            .then((font) => document.fonts.add(font))
            .catch(() => {}); // Silently fail - fallback fonts will be used
        } catch (e) {
          // Silently fail - fallback fonts will be used
        }
      });
    } catch (e) {
      // Silently fail - fallback fonts will be used
    }
  }

  // Insert CSS
  function addCss(cssString) {
    // Remove any existing dark theme CSS to prevent duplicates
    const existingCss = document.getElementById("sc-dark-theme-css");
    if (existingCss) {
      existingCss.remove();
    }

    if (typeof GM_addStyle !== "undefined") {
      GM_addStyle(cssString);
      cssLoaded = true;
    } else {
      try {
        const newCss = document.createElement("style");
        newCss.id = "sc-dark-theme-css";
        newCss.textContent = cssString;
        (document.head || document.documentElement).appendChild(newCss);
        cssLoaded = true;
      } catch (e) {
        console.warn("Failed to add CSS");
      }
    }
  }

  // Load CSS from resource or remote
  function loadCSS() {
    // Always reload if forceReloadCSS is true
    if (cssLoaded && !forceReloadCSS) return;

    try {
      if (typeof GM_getResourceText !== "undefined") {
        const css = GM_getResourceText("CSS");
        if (css) {
          // Process the CSS to add !important to all rules
          const processedCSS = css
            .replaceAll(";\n", " !important;\n")
            .replaceAll(":\n", ";\n")
            .replaceAll(
              ".BTN_EXCLUDE",
              ":not(.reportCopyright):not(.hintButton):not(.sc-classic .playbackSoundBadge .playbackSoundBadge__follow):not(.sc-classic .playbackSoundBadge .playbackSoundBadge__like):not(.sc-button-nostyle):not(.sc-button-next):not(.sc-button-pause):not(.sc-button-play):not(.sc-button-prev):not(.sc-button-blocked)"
            );
          addCss(processedCSS);
        } else {
          loadCSSFromRemote();
        }
      } else {
        loadCSSFromRemote();
      }
    } catch (e) {
      loadCSSFromRemote();
    }
  }

  // Fallback function to load CSS from remote URL
  function loadCSSFromRemote() {
    try {
      // Remove any existing link to prevent duplicates
      const existingLink = document.querySelector("link#sc-dark-theme-css");
      if (existingLink) {
        existingLink.remove();
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.id = "sc-dark-theme-css";
      // Add cache-busting parameter to force reload
      const cacheBuster = forceReloadCSS ? `?t=${Date.now()}` : "";
      link.href = `https://github.com/purr/dark-soundcloud/raw/main/dark-soundcloud.css${cacheBuster}`;
      (document.head || document.documentElement).appendChild(link);
      cssLoaded = true;
    } catch (e) {
      console.warn("Error loading CSS from remote");
    }
  }

  // Function to ensure CSS is loaded
  function ensureCSSLoaded() {
    // Always reload if forceReloadCSS is true
    if (
      !cssLoaded ||
      forceReloadCSS ||
      (!document.getElementById("sc-dark-theme-css") &&
        !document.getElementById("sc-dark-placeholders"))
    ) {
      loadCSS();
    }

    if (
      document.documentElement &&
      !document.documentElement.classList.contains("jtc-sc-dark")
    ) {
      document.documentElement.classList.add("jtc-sc-dark");
    }
  }

  // Function to handle SPA navigation
  function handleSPANavigation() {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;

      // Clear any pending timeouts to avoid memory leaks
      pendingTimeouts.forEach(clearTimeout);
      pendingTimeouts = [];

      // Force reload CSS if needed
      if (forceReloadCSS) {
        cssLoaded = false;
      }

      // Ensure CSS is loaded
      ensureCSSLoaded();

      // Reset enforced attributes to ensure styles are reapplied
      document.querySelectorAll(SELECTORS.STYLE_ENFORCED).forEach((el) => {
        el.removeAttribute("style-enforced");
        el.removeAttribute("bg-fixed");
        el.removeAttribute("text-fixed");
      });

      // Make sure hidden elements stay hidden
      document.querySelectorAll(SELECTORS.HIDDEN_ELEMENTS).forEach((el) => {
        el.style.setProperty("display", "none", "important");
      });

      // Apply dark mode and styles with strategic delays
      applyDarkMode();
      enforceStyles();

      // Schedule additional style enforcements to catch dynamically loaded content
      [100, 500, 1500].forEach((delay) => {
        const timeoutId = setTimeout(() => {
          enforceStyles();
          // Re-check for unwanted iframes that might have been loaded
          removeUnwantedIframes();
        }, delay);
        pendingTimeouts.push(timeoutId);
      });
    }
  }

  // Set up navigation monitoring
  function setupNavigationMonitoring() {
    // Method 1: Use history API if available
    if (window.history && window.history.pushState) {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = function () {
        originalPushState.apply(this, arguments);
        handleSPANavigation();
      };

      window.history.replaceState = function () {
        originalReplaceState.apply(this, arguments);
        handleSPANavigation();
      };

      window.addEventListener("popstate", handleSPANavigation);
    }

    // Method 2: Fallback to checking URL periodically (less frequently to reduce overhead)
    setInterval(handleSPANavigation, 1000);
  }

  // Unified MutationObserver with optimized performance
  function setupMutationObserver() {
    // Use a debounce mechanism to avoid excessive style enforcement
    let debounceTimeout = null;
    let pendingStyleEnforcement = false;
    let pendingIframeCheck = false;

    const observer = new MutationObserver((mutations) => {
      let shouldEnforceStyles = false;
      let shouldCheckIframes = false;

      // Process mutations efficiently
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];

        // Check for added nodes that need dark mode
        if (mutation.addedNodes && mutation.addedNodes.length) {
          for (let j = 0; j < mutation.addedNodes.length; j++) {
            const node = mutation.addedNodes[j];

            // Handle menu dark mode
            if (
              node.nodeType === 1 &&
              node.classList &&
              (node.classList.contains("m-light") ||
                node.classList.contains("m-dark"))
            ) {
              setMenuDarkMode(node);
            }

            // Check if this might be an iframe we want to hide
            if (
              node.nodeType === 1 &&
              (node.tagName === "IFRAME" ||
                (node.classList &&
                  (node.classList.contains("webiEmbeddedModule") ||
                    (node.querySelector && node.querySelector("iframe")))))
            ) {
              shouldCheckIframes = true;
            }
          }

          shouldEnforceStyles = true;
        }

        // Check for attribute changes that might need style enforcement
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "style" ||
            mutation.attributeName === "class")
        ) {
          shouldEnforceStyles = true;
        }

        // Early exit if we already know we need to enforce styles and check iframes
        if (shouldEnforceStyles && shouldCheckIframes) break;
      }

      // Debounce style enforcement to reduce performance impact
      if (shouldEnforceStyles) {
        pendingStyleEnforcement = true;

        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }

        debounceTimeout = setTimeout(() => {
          if (pendingStyleEnforcement) {
            enforceStyles();
            pendingStyleEnforcement = false;
          }

          if (pendingIframeCheck) {
            removeUnwantedIframes();
            pendingIframeCheck = false;
          }
        }, 150);
      }

      // Set flag to check for iframes in the next debounce cycle
      if (shouldCheckIframes) {
        pendingIframeCheck = true;

        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }

        debounceTimeout = setTimeout(() => {
          if (pendingIframeCheck) {
            removeUnwantedIframes();
            pendingIframeCheck = false;
          }

          if (pendingStyleEnforcement) {
            enforceStyles();
            pendingStyleEnforcement = false;
          }
        }, 150);
      }
    });

    // Start observing the document
    if (document.documentElement) {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    // Clean up observer if page is unloaded
    window.addEventListener("unload", () => {
      observer.disconnect();
      pendingTimeouts.forEach(clearTimeout);
    });

    return observer;
  }

  // Initialize everything
  function initialize() {
    // Apply dark mode
    applyDarkMode();

    // Reset CSS loaded state on page load if force reload is enabled
    if (forceReloadCSS) {
      cssLoaded = false;
    }

    // Load CSS
    loadCSS();

    // Load fonts
    loadFonts();

    // Set up navigation monitoring
    setupNavigationMonitoring();

    // Set up mutation observer
    setupMutationObserver();

    // Initial enforcement of styles
    enforceStyles();
  }

  // Start the script
  initialize();
})();

/* ============= ADDITIONAL CUSTOM FUNCTIONS ============= */

/**
 * Forces white text color in comment form inputs
 * Uses multiple approaches to ensure text is always white
 */
function enforceCommentFormTextColor() {
  try {
    // Find all comment form inputs
    const commentInputs = document.querySelectorAll(".commentForm__input");
    if (!commentInputs || commentInputs.length === 0) return;

    // Process each input
    commentInputs.forEach((input) => {
      // Skip already processed inputs
      if (input.hasAttribute("comment-text-fixed")) return;

      // Generate a unique ID for targeting this specific element
      const uniqueId =
        "sc-dark-input-" + Math.random().toString(36).substr(2, 8);
      input.id = uniqueId;

      // Add custom stylesheet for this specific input
      const styleEl = document.createElement("style");
      styleEl.textContent = `
        #${uniqueId}, 
        #${uniqueId}::selection,
        #${uniqueId}::-moz-selection,
        #${uniqueId}::first-line,
        #${uniqueId} * {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          text-shadow: none !important;
          caret-color: #ffffff !important;
        }
        
        @keyframes keepWhiteText${uniqueId} {
          0%, 100% { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
        }
        
        #${uniqueId} {
          animation: keepWhiteText${uniqueId} 1ms infinite !important;
        }
      `;
      document.head.appendChild(styleEl);

      // Apply inline styles
      input.style.setProperty("color", "#ffffff", "important");
      input.style.setProperty(
        "-webkit-text-fill-color",
        "#ffffff",
        "important"
      );
      input.style.setProperty("caret-color", "#ffffff", "important");
      input.style.setProperty("text-shadow", "none", "important");

      // Replace with a cloned element for maximum style enforcement
      const parent = input.parentNode;
      if (parent) {
        // Create wrapper
        const wrapper = document.createElement("div");
        wrapper.style.cssText =
          "position: relative; width: 100%; height: 100%;";

        // Clone the input
        const newInput = input.cloneNode(true);
        newInput.id = uniqueId;

        // Apply styles to clone
        newInput.style.setProperty("color", "#ffffff", "important");
        newInput.style.setProperty(
          "-webkit-text-fill-color",
          "#ffffff",
          "important"
        );
        newInput.style.setProperty("caret-color", "#ffffff", "important");
        newInput.style.setProperty("text-shadow", "none", "important");

        // Add event listeners
        newInput.addEventListener("input", function () {
          this.style.setProperty("color", "#ffffff", "important");
          this.style.setProperty(
            "-webkit-text-fill-color",
            "#ffffff",
            "important"
          );
        });

        newInput.addEventListener("focus", function () {
          this.style.setProperty("color", "#ffffff", "important");
          this.style.setProperty(
            "-webkit-text-fill-color",
            "#ffffff",
            "important"
          );
        });

        // Replace in DOM
        wrapper.appendChild(newInput);
        parent.replaceChild(wrapper, input);

        // Mark as fixed
        newInput.setAttribute("comment-text-fixed", "true");
      } else {
        input.setAttribute("comment-text-fixed", "true");
      }
    });

    // Set up observer for dynamically added inputs
    if (!window.commentInputObserver) {
      window.commentInputObserver = new MutationObserver((mutations) => {
        let hasNewInputs = false;

        mutations.forEach((mutation) => {
          if (mutation.addedNodes && mutation.addedNodes.length) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              if (
                node.nodeType === 1 &&
                ((node.classList &&
                  node.classList.contains("commentForm__input")) ||
                  (node.querySelector &&
                    node.querySelector(".commentForm__input")))
              ) {
                hasNewInputs = true;
                break;
              }
            }
          }
        });

        if (hasNewInputs) {
          enforceCommentFormTextColor();
        }
      });

      window.commentInputObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  } catch (e) {
    console.error("Error enforcing comment text color:", e);
  }
}

/**
 * Forces white background on reply buttons
 * Uses multiple approaches to ensure buttons always have white background
 */
function enforceReplyButtonStyles() {
  try {
    // Find all reply buttons
    const replyButtons = document.querySelectorAll(
      ".commentItem__replyButton.sc-link-primary"
    );
    if (!replyButtons || replyButtons.length === 0) return;

    // Process each button
    replyButtons.forEach((button) => {
      // Skip already processed buttons
      if (button.hasAttribute("reply-button-fixed")) return;

      // Generate unique ID
      const uniqueId = "sc-dark-btn-" + Math.random().toString(36).substr(2, 8);
      button.id = uniqueId;

      // Add custom stylesheet for this button
      const styleEl = document.createElement("style");
      styleEl.textContent = `
        #${uniqueId} {
          all: unset;
          display: inline-block !important;
          background-color: #ffffff !important;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          text-shadow: none !important;
          padding: 3px 10px !important;
          border-radius: 12px !important;
          cursor: pointer !important;
          font-family: inherit !important;
          font-size: inherit !important;
          border: none !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) !important;
          position: relative !important;
        }
        
        #${uniqueId}:hover {
          background-color: #f0f0f0 !important;
        }
        
        @keyframes keepWhiteBg${uniqueId} {
          0%, 100% { background-color: #ffffff !important; }
        }
        
        #${uniqueId} {
          animation: keepWhiteBg${uniqueId} 1ms infinite !important;
        }
      `;
      document.head.appendChild(styleEl);

      // Replace with a new element
      const parent = button.parentNode;
      if (parent) {
        // Save original properties
        const text = button.textContent || "Reply";
        const href = button.getAttribute("href") || "#";
        const clickHandler = button.onclick;

        // Create new button
        const newButton = document.createElement("a");
        newButton.id = uniqueId;
        newButton.className = button.className;
        newButton.textContent = text;
        newButton.href = href;

        // Apply styles
        newButton.style.cssText = `
          all: unset;
          display: inline-block !important;
          background-color: #ffffff !important;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          text-shadow: none !important;
          padding: 3px 10px !important;
          border-radius: 12px !important;
          cursor: pointer !important;
          font-family: inherit !important;
          font-size: inherit !important;
          border: none !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) !important;
          margin: 0 !important;
          text-decoration: none !important;
        `;

        // Preserve original click handler
        if (clickHandler) {
          newButton.onclick = clickHandler;
        }

        // Add hover effects
        newButton.addEventListener("mouseenter", function () {
          this.style.setProperty("background-color", "#f0f0f0", "important");
        });

        newButton.addEventListener("mouseleave", function () {
          this.style.setProperty("background-color", "#ffffff", "important");
        });

        // Replace in DOM
        parent.replaceChild(newButton, button);

        // Mark as fixed
        newButton.setAttribute("reply-button-fixed", "true");
      } else {
        // Apply styles to original if we can't replace
        button.setAttribute("reply-button-fixed", "true");

        button.style.cssText = `
          all: unset;
          display: inline-block !important;
          background-color: #ffffff !important;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          text-shadow: none !important;
          padding: 3px 10px !important;
          border-radius: 12px !important;
          cursor: pointer !important;
          font-family: inherit !important;
          font-size: inherit !important;
          border: none !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) !important;
          margin: 0 !important;
          text-decoration: none !important;
        `;

        button.addEventListener("mouseenter", function () {
          this.style.setProperty("background-color", "#f0f0f0", "important");
        });

        button.addEventListener("mouseleave", function () {
          this.style.setProperty("background-color", "#ffffff", "important");
        });
      }
    });

    // Set up observer for dynamically added buttons
    if (!window.replyButtonObserver) {
      window.replyButtonObserver = new MutationObserver((mutations) => {
        let hasNewButtons = false;

        mutations.forEach((mutation) => {
          if (mutation.addedNodes && mutation.addedNodes.length) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              if (
                node.nodeType === 1 &&
                ((node.classList &&
                  node.classList.contains("commentItem__replyButton")) ||
                  (node.querySelector &&
                    node.querySelector(
                      ".commentItem__replyButton.sc-link-primary"
                    )))
              ) {
                hasNewButtons = true;
                break;
              }
            }
          }
        });

        if (hasNewButtons) {
          enforceReplyButtonStyles();
        }
      });

      window.replyButtonObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  } catch (e) {
    console.error("Error enforcing reply button styles:", e);
  }
}
