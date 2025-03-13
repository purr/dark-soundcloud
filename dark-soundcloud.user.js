// ==UserScript==
// @name         Modern Design and Dark Theme for SoundCloud
// @version      0.27.0
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
// ==/UserScript==

(function () {
  "use strict";

  // Makes a SoundCloud menu dark using the built-in styles
  function setMenuDarkMode(node) {
    // Always use dark mode
    node.classList.remove("m-light");
    node.classList.add("m-dark");
  }

  // Function to remove Artist Tools iframe
  function removeArtistToolsIframe() {
    const iframes = document.querySelectorAll(
      '.webiEmbeddedModuleIframe[title="Artist tools"]'
    );
    if (iframes && iframes.length > 0) {
      iframes.forEach((iframe) => {
        // Try to find and remove the parent container too
        let parent = iframe.parentElement;
        while (
          parent &&
          !parent.classList.contains("sidebarModule") &&
          parent !== document.body
        ) {
          parent = parent.parentElement;
        }

        if (parent && parent.classList.contains("sidebarModule")) {
          parent.remove();
        } else {
          iframe.remove();
        }
      });
    }
  }

  // Function to enforce styles with improved performance
  function enforceStyles() {
    try {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        // Force sidebar title to be white - use more efficient selectors
        document
          .querySelectorAll(
            ".sidebarHeader__actualTitle, .sidebarHeader__actualTitle__webi__style"
          )
          .forEach((element) => {
            if (element && !element.hasAttribute("style-enforced")) {
              element.style.setProperty("color", "#ffffff", "important");
              element.style.setProperty("text-shadow", "none", "important");
              element.style.setProperty(
                "-webkit-text-fill-color",
                "#ffffff",
                "important"
              );
              element.setAttribute("style-enforced", "true");
            }
          });

        // Set light grey for refresh text
        document
          .querySelectorAll(".sidebarHeader__more__webi_style")
          .forEach((element) => {
            if (element && !element.hasAttribute("style-enforced")) {
              element.style.setProperty("color", "#a0a0a0", "important");
              element.style.setProperty("text-shadow", "none", "important");
              element.style.setProperty(
                "-webkit-text-fill-color",
                "#a0a0a0",
                "important"
              );
              element.setAttribute("style-enforced", "true");
            }
          });

        // Set very light grey for artist usernames
        document
          .querySelectorAll(".artistShortcutTile__username")
          .forEach((element) => {
            if (element && !element.hasAttribute("style-enforced")) {
              element.style.setProperty("color", "#f0f0f0", "important");
              element.style.setProperty("text-shadow", "none", "important");
              element.style.setProperty(
                "-webkit-text-fill-color",
                "#f0f0f0",
                "important"
              );
              element.setAttribute("style-enforced", "true");
            }
          });

        // Set placeholder color for textfields - more efficient implementation
        if (!document.getElementById("sc-dark-placeholders")) {
          const style = document.createElement("style");
          style.id = "sc-dark-placeholders";
          style.textContent = `
            .textfield__input.sc-input.sc-input-medium::placeholder,
            input.textfield__input.sc-input.sc-input-medium::placeholder { 
              color: #bdbdbd !important; 
              opacity: 1 !important; 
            }
            .textfield__input.sc-input.sc-input-medium::-webkit-input-placeholder { 
              color: #bdbdbd !important; 
              opacity: 1 !important; 
            }
            .textfield__input.sc-input.sc-input-medium::-moz-placeholder { 
              color: #bdbdbd !important; 
              opacity: 1 !important; 
            }
            .textfield__input.sc-input.sc-input-medium::-ms-input-placeholder { 
              color: #bdbdbd !important; 
              opacity: 1 !important; 
            }
          `;
          (document.head || document.body).appendChild(style);
        }

        // Remove Artist Tools iframe
        removeArtistToolsIframe();
      });
    } catch (e) {
      console.warn("Error in enforceStyles: " + e.message);
    }
  }

  // Function to apply dark mode
  function jtcScApplyDark() {
    // Apply dark mode to menus
    if (document.querySelectorAll) {
      document
        .querySelectorAll(".m-light, .m-dark")
        .forEach((node) => setMenuDarkMode(node));
    }
  }

  // Set dark mode on load - MODIFIED to always use dark mode
  function applyDarkMode() {
    if (document.documentElement) {
      document.documentElement.classList.add("jtc-sc-dark");
      jtcScApplyDark();
    } else {
      // If document isn't ready yet, try again in a moment
      setTimeout(applyDarkMode, 10);
    }
  }

  // Apply dark mode
  applyDarkMode();

  // Remove the toggle dark mode functionality
  window.jtcScToggleDark = function () {
    // Do nothing - dark mode only
    console.log("This version is dark mode only");
  };

  // Load fonts with error handling
  function loadFont(weight, url) {
    try {
      const fontFace = new FontFace("SoundCloudSans", `url(${url})`, {
        style: "normal",
        stretch: "normal",
        weight: weight,
      });

      fontFace
        .load()
        .then(() => document.fonts.add(fontFace))
        .catch((err) =>
          console.warn(
            `Failed to load SoundCloud Sans ${weight}: ${err.message}`
          )
        );
    } catch (e) {
      console.warn(
        `Error creating font face for SoundCloud Sans ${weight}: ${e.message}`
      );
    }
  }

  // Load fonts with error handling
  if (typeof FontFace !== "undefined" && document.fonts) {
    // Define font URLs as variables
    const FONT_BASE_URL =
      "https://github.com/purr/dark-soundcloud/raw/main/fonts/";
    const FONT_URLS = {
      500: FONT_BASE_URL + "soundcloud-sans-500.woff2",
      700: FONT_BASE_URL + "soundcloud-sans-700.woff2",
      900: FONT_BASE_URL + "soundcloud-sans-900.woff2",
    };

    // Try to use GM_getResourceURL if available for local font files
    if (typeof GM_getResourceURL !== "undefined") {
      try {
        loadFont(500, GM_getResourceURL("FONT_500"));
        loadFont(700, GM_getResourceURL("FONT_700"));
        loadFont(900, GM_getResourceURL("FONT_900"));
      } catch (e) {
        console.warn("Error loading fonts from resources: " + e.message);
        // Fallback to GitHub repo
        loadFont(500, FONT_URLS[500]);
        loadFont(700, FONT_URLS[700]);
        loadFont(900, FONT_URLS[900]);
      }
    } else {
      // Fallback to GitHub repo if GM_getResourceURL is not available
      loadFont(500, FONT_URLS[500]);
      loadFont(700, FONT_URLS[700]);
      loadFont(900, FONT_URLS[900]);
    }
  }

  // Insert CSS at the very end of the document
  // so it can safely override SoundCloud styles without !important.
  function addCss(cssString) {
    if (typeof GM_addStyle !== "undefined") {
      // Use Tampermonkey/Greasemonkey's built-in function if available
      GM_addStyle(cssString);
    } else {
      // Fallback to creating a style element
      try {
        const newCss = document.createElement("style");
        newCss.type = "text/css";
        newCss.textContent = cssString;

        // Try to append to head first (for document-start execution)
        if (document.head) {
          document.head.appendChild(newCss);
        }
        // Fallback to body if head is not available yet
        else if (document.body) {
          document.body.appendChild(newCss);
        }
        // If neither is available, wait for DOM to be ready
        else {
          document.addEventListener("DOMContentLoaded", function () {
            (document.head || document.body).appendChild(newCss);
          });
        }
      } catch (e) {
        console.warn("Failed to add CSS: " + e.message);
      }
    }
  }

  // Load CSS from resource
  function loadCSS() {
    try {
      if (typeof GM_getResourceText !== "undefined") {
        // Get CSS from resource
        const css = GM_getResourceText("CSS");
        if (css) {
          // Process the CSS to add !important to all rules
          const processedCSS = css
            .replaceAll(";\n", " !important;\n")
            .replaceAll(":\n", ";\n")
            .replaceAll(
              "$BTN_EXCLUDE",
              ":not(.reportCopyright):not(.hintButton):not(.sc-classic .playbackSoundBadge .playbackSoundBadge__follow):not(.sc-classic .playbackSoundBadge .playbackSoundBadge__like):not(.sc-button-nostyle):not(.sc-button-next):not(.sc-button-pause):not(.sc-button-play):not(.sc-button-prev):not(.sc-button-blocked)"
            );

          // Add the processed CSS
          addCss(processedCSS);
        } else {
          console.warn("Failed to load CSS from resource");
          loadCSSFromRemote();
        }
      } else {
        // Fallback to loading from remote URL
        loadCSSFromRemote();
      }
    } catch (e) {
      console.warn("Error loading CSS from resource: " + e.message);
      loadCSSFromRemote();
    }
  }

  // Fallback function to load CSS from remote URL
  function loadCSSFromRemote() {
    try {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href =
        "https://github.com/purr/dark-soundcloud/raw/main/dark-soundcloud.css";
      document.head.appendChild(link);
    } catch (e) {
      console.warn("Error loading CSS from remote: " + e.message);
    }
  }

  // Load the CSS
  loadCSS();

  // Unified MutationObserver to handle all DOM changes
  const unifiedObserver = new MutationObserver((mutations) => {
    let shouldEnforceStyles = false;
    let hasMenuChanges = false;

    // Process mutations to check what needs to be handled
    mutations.forEach(({ addedNodes, target, type, attributeName }) => {
      // Check for added nodes that need dark mode
      if (addedNodes && addedNodes.length) {
        addedNodes.forEach((node) => {
          // Handle menu dark mode
          if (
            node.nodeType === 1 &&
            (node.classList?.contains("m-light") ||
              node.classList?.contains("m-dark"))
          ) {
            setMenuDarkMode(node);
            hasMenuChanges = true;
          }

          // Any added node might need style enforcement
          shouldEnforceStyles = true;
        });
      }

      // Check for attribute changes that might need style enforcement
      if (
        type === "attributes" &&
        (attributeName === "style" || attributeName === "class")
      ) {
        shouldEnforceStyles = true;
      }
    });

    // Throttle style enforcement to avoid performance issues
    if (shouldEnforceStyles) {
      if (unifiedObserver.timeout) {
        clearTimeout(unifiedObserver.timeout);
      }
      unifiedObserver.timeout = setTimeout(enforceStyles, 100);
    }

    // Apply dark mode if menu changes were detected
    if (hasMenuChanges) {
      jtcScApplyDark();
    }
  });

  // Function to start the unified observer
  function startUnifiedObserver() {
    if (document.documentElement) {
      // Start observing the document with the configured parameters
      unifiedObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      // Initial enforcement of styles and removal of iframes
      enforceStyles();
    } else {
      // If document isn't ready yet, try again in a moment
      setTimeout(startUnifiedObserver, 10);
    }
  }

  // Start the unified observer
  startUnifiedObserver();

  // Clean up observer if page is unloaded
  window.addEventListener("unload", function () {
    if (unifiedObserver) {
      unifiedObserver.disconnect();
    }
  });
})();
