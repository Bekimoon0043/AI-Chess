# Deployment Guide

## Target Platform

**GitHub Pages** — Free static hosting with custom domain support.

## Deployment Steps

### 1. Repository Setup
Ensure your repository is public (required for free GitHub Pages).

### 2. Enable GitHub Pages
1. Go to repository **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` → `/ (root)`
4. Save

### 3. Verify Deployment
- Your site will be available at `https://bekimoon0043.github.io/AI-Chess/`
- Initial deployment may take 1–2 minutes

## Cache Busting

When releasing updates, increment the cache version in `sw.js`:

```javascript
const CACHE_NAME = 'chess-v2';  // Increment this
```

This forces the Service Worker to cache-bust on next visit.

## Pre-Release Checklist

- [ ] `sw.js` cache list includes all new assets
- [ ] `manifest.json` version updated (if applicable)
- [ ] `memory/CHANGELOG.md` updated with version date
- [ ] Test on Chrome (desktop)
- [ ] Test on Safari (iOS)
- [ ] Test PWA install (Chrome → Install AI-Chess)
- [ ] Test offline mode (DevTools → Network → Offline)
- [ ] Lighthouse audit score > 90

## Rollback

If a release breaks:
1. Revert the problematic commit
2. Increment `CACHE_NAME` again to force cache refresh
3. Push to `main`

## Custom Domain (Optional)

1. Add `CNAME` file to repository root with your domain
2. Configure DNS A records to GitHub Pages IPs
3. Enable HTTPS in repository Settings → Pages

## Performance Budget

| Metric | Target | Max |
|--------|--------|-----|
| First Contentful Paint | < 1.0s | 1.5s |
| Time to Interactive | < 2.0s | 3.0s |
| Lighthouse Performance | 90 | 80 |
| Total JS Size | < 50KB | 100KB |
| Total CSS Size | < 15KB | 30KB |
