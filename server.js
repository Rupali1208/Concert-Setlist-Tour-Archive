/**
 * ConcertArchive Frontend Static Server + API Proxy
 * Serves static files on port 3000 and proxies /api/* to Flask on port 5000.
 * Run with: node frontend/server.js
 */
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT       = 3000;
const FLASK_HOST = 'localhost';
const FLASK_PORT = 5000;
const PUBLIC_DIR = path.join(__dirname);

const mimeTypes = {
    '.html': 'text/html',
    '.js'  : 'application/javascript',
    '.css' : 'text/css',
    '.json': 'application/json',
    '.png' : 'image/png',
    '.jpg' : 'image/jpeg',
    '.svg' : 'image/svg+xml',
    '.ico' : 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

// ── Proxy request to Flask backend ──────────────────────────────────────────
function proxyToFlask(req, res) {
    const options = {
        hostname: FLASK_HOST,
        port    : FLASK_PORT,
        path    : req.url,
        method  : req.method,
        headers : { ...req.headers, host: `${FLASK_HOST}:${FLASK_PORT}` }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        // Pass CORS headers through
        res.writeHead(proxyRes.statusCode, {
            ...proxyRes.headers,
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        });
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        console.error(`❌ Flask proxy error (is Flask running on port ${FLASK_PORT}?):`, err.message);
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            data   : null,
            message: `Backend offline — Flask is not running on port ${FLASK_PORT}. Start it with: python backend/app.py`
        }));
    });

    // Pipe request body (for POST/PUT)
    req.pipe(proxyReq, { end: true });
}

// ── Main HTTP server ─────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
    // Handle preflight CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        });
        return res.end();
    }

    // Proxy all /api/* routes to Flask
    if (req.url.startsWith('/api')) {
        return proxyToFlask(req, res);
    }

    // Serve static files and clean URLs
    let safePath = decodeURI(req.url.split('?')[0]);
    if (safePath === '/' || safePath === '/landing') safePath = '/landing.html';
    else if (safePath === '/login') safePath = '/login.html';
    else if (safePath === '/dashboard') safePath = '/index.html';


    const filePath = path.join(PUBLIC_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
        }
        const ext  = path.extname(filePath).toLowerCase();
        const mime = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 Frontend UI  →  http://localhost:${PORT}`);
    console.log(`🔀 API Proxy    →  /api/* → http://${FLASK_HOST}:${FLASK_PORT}`);
    console.log(`\n⚠️  Make sure Flask backend is running:`);
    console.log(`   cd backend && python app.py\n`);
});
