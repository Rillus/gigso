const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    // Parse the URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/demos/index.html';
    }
    
    // Remove leading slash and resolve path
    const filePath = path.join(__dirname, pathname);
    
    // Get file extension
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>404 - File Not Found</title></head>
                        <body>
                            <h1>404 - File Not Found</h1>
                            <p>The requested file ${pathname} was not found.</p>
                            <p><a href="/demos/">Go to Demo Index</a></p>
                        </body>
                    </html>
                `);
            } else {
                // Server error
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>500 - Server Error</title></head>
                        <body>
                            <h1>500 - Server Error</h1>
                            <p>An error occurred while processing your request.</p>
                            <p><a href="/demos/">Go to Demo Index</a></p>
                        </body>
                    </html>
                `);
            }
            return;
        }
        
        // Success - send file
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`🎵 Gigso Demo Server running at http://localhost:${PORT}`);
    console.log(`📁 Demo Index: http://localhost:${PORT}/demos/`);
    console.log(`🚀 Press Ctrl+C to stop the server`);
    console.log('');
    console.log('Available demo pages:');
    console.log('  • HandPan: http://localhost:8000/demos/hand-pan-demo.html');
    console.log('  • Fretboard: http://localhost:8000/demos/fretboard-demo.html');
    console.log('  • PianoRoll: http://localhost:8000/demos/piano-roll-demo.html');
    console.log('  • ChordPalette: http://localhost:8000/demos/chord-palette-demo.html');
    console.log('  • And many more...');
    console.log('');
    console.log('💡 Tip: Open http://localhost:8000/demos/ to see all available demos');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down demo server...');
    server.close(() => {
        console.log('✅ Demo server stopped');
        process.exit(0);
    });
});