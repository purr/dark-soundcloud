// ==UserScript==
// @name         Modern Design and Dark Theme for SoundCloud
// @version      0.30.5
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

  // Track if CSS has been loaded
  let cssLoaded = false;

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

    // Hide unwanted iframes
    removeUnwantedIframes();
  }

  // Function to enforce styling on username links in comments
  function enforceUsernameLinks() {
    try {
      // Find all username links in comments
      const usernameLinks = document.querySelectorAll(
        ".commentItem__usernameLink"
      );

      if (!usernameLinks.length) return;

      usernameLinks.forEach((link) => {
        if (!link.hasAttribute("username-link-fixed")) {
          // Set text color
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

          // Set background and styling
          link.style.setProperty(
            "background-color",
            "var(--jtc-sc-border)",
            "important"
          );
          link.style.setProperty("text-decoration", "none", "important");
          link.style.setProperty("padding", "2px 4px", "important");
          link.style.setProperty("border-radius", "3px", "important");

          // Add transition
          link.style.setProperty(
            "transition",
            "opacity 0.2s ease-in-out, text-decoration 0.2s ease-in-out",
            "important"
          );

          // Mark as fixed
          link.setAttribute("username-link-fixed", "true");

          // Add hover event listeners
          link.addEventListener("mouseenter", function () {
            this.style.setProperty("opacity", "0.85", "important");
            this.style.setProperty("text-decoration", "underline", "important");
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
    if (cssLoaded) return;

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
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.id = "sc-dark-theme-css";
      link.href =
        "https://github.com/purr/dark-soundcloud/raw/main/dark-soundcloud.css";
      (document.head || document.documentElement).appendChild(link);
      cssLoaded = true;
    } catch (e) {
      console.warn("Error loading CSS from remote");
    }
  }

  // Function to ensure CSS is loaded
  function ensureCSSLoaded() {
    if (
      !cssLoaded ||
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
