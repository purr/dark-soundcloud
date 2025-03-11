# SoundCloud Sans Fonts

This directory contains the SoundCloud Sans font files used by the userscript.

## Font Files

- `soundcloud-sans-500.woff2` - SoundCloud Sans Regular (Weight 500)
- `soundcloud-sans-700.woff2` - SoundCloud Sans Bold (Weight 700)
- `soundcloud-sans-900.woff2` - SoundCloud Sans Black (Weight 900)

## Usage

These font files are referenced in the userscript via the `@resource` metadata. The script will attempt to load these fonts from the repository, with a fallback to the CDN if that fails.

## Source

These fonts are originally from SoundCloud and are used by the official SoundCloud website. They are included here for the purpose of providing a consistent user experience with the dark theme.

## How to Add the Actual Font Files

To add the actual font files to this repository:

1. Download the font files from the CDN:

   - https://cdn.jottocraft.com/userscripts/modern-sc/assets/soundcloud-sans-500.woff2
   - https://cdn.jottocraft.com/userscripts/modern-sc/assets/soundcloud-sans-700.woff2
   - https://cdn.jottocraft.com/userscripts/modern-sc/assets/soundcloud-sans-900.woff2

2. Place them in this directory.

3. Make sure the filenames match exactly what's referenced in the userscript metadata.
