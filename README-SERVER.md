# Serving the Gigso Static Site

## The Problem
When you open `demos/index.html` directly in a browser, you get MIME type errors because:
- Browsers expect CSS files to be served with `text/css` MIME type
- JavaScript modules need to be served with `application/javascript` MIME type
- Opening files directly with `file://` protocol doesn't provide proper MIME types

## Solutions

### Option 1: Use Node.js serve (Recommended)
```bash
# Install serve globally (one time)
npm install -g serve

# Serve the site
serve . -p 8000

# Then visit: http://localhost:8000/demos/index.html
```

### Option 2: Use Python's built-in server
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Then visit: http://localhost:8000/demos/index.html
```

### Option 3: Use PHP's built-in server
```bash
php -S localhost:8000

# Then visit: http://localhost:8000/demos/index.html
```

### Option 4: Use Live Server (VS Code extension)
1. Install the "Live Server" extension in VS Code
2. Right-click on `demos/index.html`
3. Select "Open with Live Server"

### Option 5: Use any other static file server
- `live-server` (Node.js)
- `http-server` (Node.js)
- `browser-sync` (Node.js)

## Why This Happens
Static sites with ES6 modules and relative CSS/JS imports must be served over HTTP/HTTPS, not the `file://` protocol. This is a security feature of modern browsers.

## Quick Fix
Just run one of the commands above and access your site at `http://localhost:8000/demos/index.html` instead of opening the file directly.