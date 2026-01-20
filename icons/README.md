# Icon Files

This directory contains the extension icons in multiple sizes.

## Current Icons (SVG Placeholders)

- `icon16.svg` - 16x16px (toolbar icon)
- `icon32.svg` - 32x32px (DevTools panel)
- `icon48.svg` - 48x48px (extension management)
- `icon128.svg` - 128x128px (Chrome Web Store)

## Design Concept

The icons feature:

- Blue gradient background (#4A90E2 to #357ABD)
- "HTTP" text at the top
- Circular arrows representing the request repeat functionality
- Professional and modern appearance

## TODO: Convert to PNG

The manifest.json references PNG files. You'll need to convert these SVG files to PNG format:

```bash
# Using ImageMagick or similar tool
convert icon16.svg icon16.png
convert icon32.svg icon32.png
convert icon48.svg icon48.png
convert icon128.svg icon128.png
```

Or use an online SVG to PNG converter, or create custom PNG icons in a graphics editor like:

- Figma
- Adobe Illustrator
- Inkscape (free)
- GIMP (free)

## Design Guidelines

- Use consistent color scheme with the extension theme
- Ensure icons are recognizable at all sizes
- Consider both light and dark backgrounds
- Maintain 16px safe area for smallest icon
