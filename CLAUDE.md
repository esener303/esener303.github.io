# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static personal portfolio website for Michał Demczyszak (michaldemczyszak.com). The site is a single-page HTML landing page with social media links and a background image. No build process, dependencies, or tests are required.

## Architecture

**Static site**: The site is `index.html` with `styles.css` and `script.js`. No build tools or JS framework. All icons are inline SVG.

**Assets**:
- `favicon.svg` - Site favicon

**Social Links**: The site displays links to:
- Email (gmail)
- Blog (sharepointdevelopmentblog.wordpress.com)
- LinkedIn
- GitHub
- Instagram

## Deployment

The site is deployed to two platforms automatically on push to main:

1. **GitHub Pages** (`.github/workflows/static.yml`): Deploys entire repository root to GitHub Pages
2. **Azure Static Web Apps** (`.github/workflows/azure-static-web-apps-brave-pebble-0a3cfe803.yml`): Deploys to Azure with app_location set to "/"

Custom domain: `michaldemczyszak.com` (configured in CNAME)

## Development

Since this is a static HTML site:
- Edit `index.html` directly for content/style changes
- Replace image assets as needed
- No build, compile, or test commands required
- Test locally by opening `index.html` in a browser or using a simple HTTP server:
  ```bash
  python3 -m http.server 8000
  ```

## File Structure

- `index.html` - Main HTML page
- `styles.css` - Site styles
- `script.js` - Matrix background, typed role, scroll reveal, nav toggle
- `favicon.svg` - Site favicon
- `CNAME` - Custom domain configuration
- `robots.txt`, `sitemap.xml` - SEO
- `.github/workflows/` - CI/CD configurations
