// ==UserScript==
// @name         Modern Design and Dark Theme for SoundCloud (Optimized)
// @version      0.26.0
// @description  A lightweight dark theme for SoundCloud.com
// @author       purr
// @namespace    https://github.com/purr/dark-soundcloud
// @homepage     https://github.com/purr/dark-soundcloud
// @supportURL   https://github.com/purr/dark-soundcloud/issues
// @updateURL    https://github.com/purr/dark-soundcloud/raw/main/soundcloud-dark-theme.user.js
// @downloadURL  https://github.com/purr/dark-soundcloud/raw/main/soundcloud-dark-theme.user.js
// @match        *://soundcloud.com/*
// @match        *://*.soundcloud.com/*
// @grant        GM_addStyle
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  // Single observer to handle all DOM mutations
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        // Check for menus that need to be dark
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            // Element node
            if (
              node.classList &&
              (node.classList.contains("m-light") ||
                node.classList.contains("m-dark"))
            ) {
              // Set menu to dark mode
              node.classList.remove("m-light");
              node.classList.add("m-dark");
            }

            // Remove artist tools iframe if found
            if (node.tagName === "IFRAME" && node.title === "Artist tools") {
              let parent = node.parentElement;
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
                node.remove();
              }
            }
          }
        }
      }
    }
  });

  // Start the observer when document is ready
  if (document.documentElement) {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    });
  }

  // Apply dark mode class to root
  function applyDarkMode() {
    if (document.documentElement) {
      document.documentElement.classList.add("jtc-sc-dark");
    }
  }

  // Apply dark mode immediately and on DOM ready
  applyDarkMode();
  document.addEventListener("DOMContentLoaded", applyDarkMode);

  // Insert CSS using GM_addStyle or fallback
  function addCss(cssString) {
    if (typeof GM_addStyle !== "undefined") {
      GM_addStyle(cssString);
    } else {
      const style = document.createElement("style");
      style.textContent = cssString;
      (document.head || document.documentElement).appendChild(style);
    }
  }

  // Core CSS variables
  addCss(`
:root {
  --jtc-sc-root-text: #ffffff;
  --jtc-sc-bg: #000000;
  --jtc-sc-header: #111;
  --jtc-sc-header-active: #0c0c0c;
  --jtc-sc-header-border: #1a1a1a;
  --jtc-sc-border-light: #212121;
  --jtc-sc-tag-bg: #262626;
  --jtc-sc-tag-hover-bg: #424242;
  --jtc-sc-light-text: #bfbfbf;
  --jtc-sc-btn-main: #ffffff;
  --jtc-sc-btn-main-text: #000000;
  --jtc-sc-btn: #272727;
  --jtc-sc-tile: #0a0a0a;
  --jtc-sc-btn-hover: #373737;
  --jtc-sc-text-verylight: #707070;
  --jtc-sc-almost-root-text: #e8e8e8;
  --jtc-sc-header-search: #242424;
  --jtc-sc-border: #585858;
  --jtc-sc-whiteout: #000000e6;
  --jtc-sc-block: #1a1a1a;
  --jtc-sc-bar: #111111;
  --jtc-sc-popup: #111111;
}

:root.jtc-sc-dark {
  color-scheme: dark;
}

/* Essential dark mode styles */
body {
  color: var(--jtc-sc-root-text) !important;
  background: var(--jtc-sc-bg) !important;
}

/* Core text colors */
.sc-classic .sidebarHeader__title,
.sc-text,
button,
input,
select,
textarea,
.sc-classic .insightsSidebarModule__title,
.sc-classic .headerMenu__link:not(.m-highlight),
.sc-classic .headerMenu__link:not(.m-highlight):focus,
.sc-classic .headerMenu__link:not(.m-highlight):hover,
.sc-classic .g-nav-item:not(.active) > .g-nav-link,
a.sc-link-dark,
.sc-type-large,
.sc-classic .mixedSelectionModule__titleText,
.sc-classic .compactTrackListItem__number,
.sc-classic .compactTrackListItem__trackTitle,
.sc-classic .blockCheckbox__title,
.sc-classic .playbackSoundBadge__titleLink,
.sc-classic .playbackSoundBadge__titleLink:visited,
.commentItem__body,
.commentItem__creatorLink, .commentItem__creatorLink:hover, .commentItem__creatorLink:visited, 
.commentItem__username, .commentItem__usernameLink, .commentItem__usernameLink:hover, 
.commentItem__usernameLink:visited,
.commentItem__replyButton, .commentItem__replyButton:hover, .commentItem__replyButton:visited {
  color: var(--jtc-sc-root-text) !important;
}

/* Secondary text colors */
.sc-type-light:not(.systemPlaylistBannerItem),
a.sc-link-light,
.sc-classic .soundTitle__uploadTime,
.sc-classic .compactTrackListItem__user,
.sc-ministats-small:not(.sc-ministats-inverted),
a.sc-link-verylight,
.sc-classic .soundContext__line,
.sc-classic .playbackTimeline__duration,
.sc-classic .notificationBadge__main,
.commentItem__createdAt, .commentItem__separator, .commentItem__timestamp,
.sc-classic .blockCheckbox,
.sc-text-light {
  color: var(--jtc-sc-light-text) !important;
}

/* Background colors */
.sc-classic .header,
.sc-classic .g-modal-section,
.sc-classic .moreActions,
.sc-classic .headerMenu,
.sc-classic .dropdownContent__container,
.sc-classic .queue,
.sc-classic .queue__itemWrapper,
.sc-classic .queue__itemsHeight,
.sc-classic .modal__modal,
.sc-classic .dialog,
.sc-classic .dialog__arrow,
.sc-classic .playControls__bg,
.sc-classic .playControls__inner,
.sc-classic .volume__sliderWrapper {
  background-color: var(--jtc-sc-popup) !important;
}

.sc-classic .sound__soundActions,
.sc-classic .listenContent__inner,
.sc-classic .l-fixed-top-one-column > .l-top,
.sc-classic .searchTitle,
.sc-classic .commentForm__wrapper,
.sc-classic .profileUploadFooter,
.sc-classic .trackManager__upsellWrapper,
.sc-classic .conversation__actions,
.sc-classic .commentFormDisabled,
.sc-background-white {
  background-color: var(--jtc-sc-bg) !important;
}

/* Sidebar header titles - high specificity */
.sidebarHeader__actualTitle,
.sidebarHeader__actualTitle__webi__style,
.sc-classic .sidebarHeader__actualTitle__webi__style {
  color: #ffffff !important;
  text-shadow: none !important;
  -webkit-text-fill-color: #ffffff !important;
}

/* Buttons */
.sc-button:not(.reportCopyright):not(.hintButton):not(.sc-classic .playbackSoundBadge .playbackSoundBadge__follow):not(.sc-classic .playbackSoundBadge .playbackSoundBadge__like):not(.sc-button-nostyle):not(.sc-button-next):not(.sc-button-pause):not(.sc-button-play):not(.sc-button-prev):not(.sc-button-blocked) {
  border: none !important;
  background-color: var(--jtc-sc-btn) !important;
  color: var(--jtc-sc-root-text) !important;
  font-weight: 400 !important;
  border-radius: 5px !important;
}

.sc-button:hover:not(.reportCopyright):not(.hintButton):not(.sc-classic .playbackSoundBadge .playbackSoundBadge__follow):not(.sc-classic .playbackSoundBadge .playbackSoundBadge__like):not(.sc-button-nostyle):not(.sc-button-next):not(.sc-button-pause):not(.sc-button-play):not(.sc-button-prev):not(.sc-button-blocked) {
  background-color: var(--jtc-sc-btn-hover) !important;
}

/* Form elements */
input,
select,
textarea {
  background-color: var(--jtc-sc-bg) !important;
  border-color: var(--jtc-sc-border) !important;
}

.g-dark input[type="password"],
.g-dark input[type="search"],
.g-dark input[type="text"],
.g-dark select,
.g-dark textarea {
  background-color: var(--jtc-sc-header-search) !important;
}

/* Hover states */
.sc-classic .compactTrackListItem.clickToPlay.active,
.sc-classic .compactTrackListItem.clickToPlay:focus,
.sc-classic .compactTrackListItem.clickToPlay:hover,
.sc-classic .compactTrackList__moreLink:focus,
.sc-classic .compactTrackList__moreLink:hover,
.sc-classic .inboxItem.active,
.sc-classic .inboxItem.unread,
.sc-classic .inboxItem:focus,
.sc-classic .inboxItem:hover,
.sc-classic .trackItem.active,
.sc-classic .trackItem.hover,
.sc-classic .queueItemView.m-active,
.sc-classic .queueItemView:hover {
  background-color: var(--jtc-sc-btn-hover) !important;
}

/* Filter adjustments */
.sc-classic .profileMenu.m-dark .headerMenu__link:after,
.sc-classic .g-nav-item:not(.active) .g-nav-link,
.sc-classic .playControls__elements .playControls__control .shuffleControl:not(.m-shuffling),
.sc-classic .playControls__elements .playControls__control .repeatControl.m-none,
.sc-classic .playControls__elements .playControls__control.playControl,
.sc-classic .playControls__elements .playControls__control.skipControl,
.sc-classic .volume__button,
.sc-classic .playbackSoundBadge__follow:not(.sc-button-selected),
.sc-classic .playbackSoundBadge__like:not(.sc-button-selected),
.sc-classic .queueItemView__more.sc-button-small:before,
.sc-classic .queueItemView__like:not(.sc-button-selected):before,
.sidebarHeader__icon {
  filter: brightness(100) grayscale(1) !important;
}

.sc-classic .loading,
.sc-classic .featureHeader__closeButton, 
.sc-classic .g-button-remove,
.sc-classic .queue__hide {
  filter: invert(1) !important;
}

/* Placeholder text */
.textfield__input.sc-input.sc-input-medium::placeholder,
input.textfield__input.sc-input.sc-input-medium::placeholder,
.textfield__input.sc-input.sc-input-medium::-webkit-input-placeholder,
.textfield__input.sc-input.sc-input-medium::-moz-placeholder,
.textfield__input.sc-input.sc-input-medium::-ms-input-placeholder {
  color: #bdbdbd !important;
  opacity: 1 !important;
}

/* Border radius for artwork */
.soundBadge__artwork .sc-artwork,
.trackItem__image .sc-artwork,
.sound__coverArt,
.playableTile__artwork,
.listenNetworkInfo__imageLink .sc-artwork,
.selectionPlaylistBanner__artwork,
.sc-classic .fullHero__artwork {
  border-radius: 6px !important;
  overflow: hidden !important;
}
`);
})();
