# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static personal portfolio website for Michał Demczyszak (michaldemczyszak.com). The site is a single-page HTML landing page with social media links and a background image. No build process, dependencies, or tests are required.

## Architecture

**Single-file static site**: The entire website is contained in `index.html` with inline CSS styling. No JavaScript framework or build tools are used.

**Assets**:
- `/background2.jpg` - Current background image (also `/back.jpg` available)
- `/logos/` - Social media icons (SVG and PNG formats): gmail, linkedin, github, instagram, wordpress, twitter, credly
- `/favicon*` - Site favicon in multiple formats

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

- `index.html` - Main and only HTML page
- `CNAME` - Custom domain configuration
- `logos/` - Social media icons
- `background2.jpg`, `back.jpg` - Background images
- `favicon*` - Site favicons
- `.github/workflows/` - CI/CD configurations
