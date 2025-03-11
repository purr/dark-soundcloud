# Modern Design and Dark Theme for SoundCloud

A sleek, modern dark theme for SoundCloud.com, inspired by the SoundCloud Android app. This userscript transforms the SoundCloud web interface with a clean, dark design that's easier on the eyes during those late-night listening sessions.

> This is a fork of [Modern Design and Dark Theme for SoundCloud](https://greasyfork.org/en/scripts/386303-modern-design-and-dark-theme-for-soundcloud) by jottocraft, with improvements for cross-platform compatibility and automatic dark mode.

## Features

- ◐ **True Dark Mode**: Deep black background with carefully chosen contrast levels
- ◧ **Modern UI**: Rounded corners, cleaner interfaces, and improved spacing
- ✓ **SoundCloud Sans Font**: Uses SoundCloud's own font for a native feel
- ↻ **Automatic Application**: No toggles or settings to manage - just install and enjoy
- ⌘ **Cross-Browser Compatible**: Works on Chrome, Firefox, Edge, Opera, and Safari

## Installation

### Step 1: Install a userscript manager

- **Chrome**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
- **Edge**: [Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
- **Opera**: [Tampermonkey](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)
- **Safari**: [Tampermonkey](https://apps.apple.com/app/apple-store/id1482490089)

### Step 2: Install the script

**Option 1: One-click installation**

- [Click here to install](https://github.com/purr/soundcloud-dark/raw/main/soundcloud-dark-theme.user.js)

**Option 2: Manual installation**

1. Open your userscript manager dashboard
2. Create a new script
3. Copy and paste the contents of [soundcloud-dark-theme.user.js](soundcloud-dark-theme.user.js)
4. Save the script

## How It Works

This userscript applies a comprehensive dark theme to SoundCloud by:

1. Injecting custom CSS that overrides SoundCloud's default styles
2. Using SoundCloud's built-in dark mode for menus and components
3. Loading the official SoundCloud Sans font from local files
4. Continuously monitoring the DOM to ensure the dark theme is applied to new elements

## Font Files

The repository includes the SoundCloud Sans font files in the [fonts](./fonts) directory:

- `soundcloud-sans-500.woff2` - Regular weight
- `soundcloud-sans-700.woff2` - Bold weight
- `soundcloud-sans-900.woff2` - Black weight

These fonts are referenced in the userscript via the `@resource` metadata and loaded using the FontFace API.

## Customization

While this script is designed to work without configuration, advanced users can modify the CSS variables at the beginning of the script to customize colors:

```css
:root {
  --jtc-sc-root-text: #ffffff;
  --jtc-sc-bg: #000000;
  --jtc-sc-header: #111;
  /* and many more... */
}
```

## Troubleshooting

**Issue**: Some elements appear in light mode

- **Solution**: Try refreshing the page. If the issue persists, please [open an issue](https://github.com/purr/soundcloud-dark/issues).

**Issue**: Fonts don't look right

- **Solution**: The script loads SoundCloud Sans fonts from the repository. If your network blocks this, the system font will be used as a fallback.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- **Original script**: [Modern Design and Dark Theme for SoundCloud](https://greasyfork.org/en/scripts/386303-modern-design-and-dark-theme-for-soundcloud) by jottocraft
- **Improvements**: Cross-platform compatibility, automatic dark mode, and local font loading
- **Fonts**: SoundCloud Sans fonts are property of SoundCloud and are included for a consistent user experience

## Acknowledgments

- Inspired by the SoundCloud Android app's design
- Thanks to the SoundCloud team for creating an amazing platform for music discovery
- Special thanks to all contributors and users who provide feedback

---

Made with ♥ by [purr](https://github.com/purr)
