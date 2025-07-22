# Cloudflare Pages Deployment Troubleshooting

## Issue: MIME Type Errors on Live Site

### Problem Description
When accessing `https://gigso.pages.dev/demos/index.html`, you get these errors:
- `Refused to apply style from 'https://gigso.pages.dev/demos/styles.css' because its MIME type ('text/html') is not a supported stylesheet MIME type`
- `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`

### Root Cause
The `_redirects` file was using `/*` which redirects ALL requests to `/index.html`, including subdirectory requests like `/demos/index.html`. This caused:
1. `/demos/index.html` to serve the root `index.html` content instead
2. CSS/JS files to be requested from wrong paths
3. Server returning HTML error pages instead of CSS/JS files

### Solution Applied
1. **Fixed `_redirects`**: Changed from `/*` to `/` to only redirect the root path
2. **Enhanced `_headers`**: Added explicit MIME type headers for CSS and JS files
3. **Added demo-specific headers**: Ensured `/demos/` subdirectory has proper configuration

### Configuration Files

#### `_redirects` (Fixed)
```
/    /index.html   200
```
Instead of the problematic:
```
/*    /index.html   200
```

#### `_headers` (Enhanced)
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/*.js
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/javascript

/*.css
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: text/css

/demos/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff

/demos/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable

/demos/*.css
  Content-Type: text/css
  Cache-Control: public, max-age=31536000, immutable

/demos/styles/*.css
  Content-Type: text/css
  Cache-Control: public, max-age=31536000, immutable
```

## Common Deployment Issues

### 1. MIME Type Errors
**Symptoms**: CSS/JS files return HTML instead of proper content
**Causes**: 
- Missing Content-Type headers
- Server returning error pages
- Wrong file paths

**Solutions**:
- Add explicit Content-Type headers in `_headers`
- Check file paths are correct
- Ensure files exist in expected locations

### 2. Redirect Loops
**Symptoms**: Infinite redirects or wrong pages served
**Causes**: 
- Overly broad redirects (`/*`)
- Conflicting redirect rules

**Solutions**:
- Use specific paths in redirects
- Test redirects locally first
- Check for conflicting rules

### 3. Subdirectory Access Issues
**Symptoms**: `/demos/` or other subdirectories not accessible
**Causes**:
- Root-level redirects catching subdirectory requests
- Missing subdirectory-specific headers

**Solutions**:
- Avoid `/*` redirects
- Add subdirectory-specific headers
- Test subdirectory access

### 4. ES6 Module Loading Failures
**Symptoms**: JavaScript modules fail to load
**Causes**:
- Wrong MIME type for .js files
- Missing module-specific headers

**Solutions**:
- Set `Content-Type: application/javascript` for .js files
- Ensure proper module loading headers

## Testing Deployment Changes

### Local Testing
```bash
# Test with local server
npx serve . -p 8000
# or
python3 -m http.server 8000

# Visit http://localhost:8000/demos/index.html
```

### Verification Steps
1. Check browser dev tools Network tab for correct MIME types
2. Verify CSS files load with `text/css` content type
3. Verify JS files load with `application/javascript` content type
4. Test subdirectory access (e.g., `/demos/`)
5. Check for any 404 errors in console

### Cloudflare Pages Testing
1. Deploy changes to Cloudflare Pages
2. Clear browser cache
3. Test live URLs
4. Check Cloudflare Pages logs for errors

## Best Practices

### Redirect Rules
- ✅ Use specific paths: `/` → `/index.html`
- ❌ Avoid broad patterns: `/*` → `/index.html`
- ✅ Test subdirectory access after changes

### Header Configuration
- ✅ Set explicit Content-Type headers
- ✅ Use subdirectory-specific headers when needed
- ✅ Include security headers
- ✅ Set appropriate cache headers

### File Organisation
- ✅ Keep deployment config files in root
- ✅ Use relative paths in HTML files
- ✅ Test file paths work from subdirectories

## Emergency Rollback
If deployment breaks:
1. Revert `_redirects` to previous working version
2. Revert `_headers` to previous working version
3. Deploy rollback
4. Test functionality
5. Debug issue locally before re-deploying

## Monitoring
- Check Cloudflare Pages analytics for 404 errors
- Monitor browser console errors on live site
- Test critical paths after deployments
- Keep deployment configuration documented