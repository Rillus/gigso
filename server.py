#!/usr/bin/env python3
import http.server
import socketserver
import os
import mimetypes

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Set proper MIME types for common file types
        if self.path.endswith('.css'):
            self.send_header('Content-Type', 'text/css')
        elif self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript')
        elif self.path.endswith('.mjs'):
            self.send_header('Content-Type', 'application/javascript')
        elif self.path.endswith('.html'):
            self.send_header('Content-Type', 'text/html')
        elif self.path.endswith('.json'):
            self.send_header('Content-Type', 'application/json')
        
        super().end_headers()

if __name__ == "__main__":
    PORT = 8000
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print(f"Access demos at http://localhost:{PORT}/demos/index.html")
        httpd.serve_forever()