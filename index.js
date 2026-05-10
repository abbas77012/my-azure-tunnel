const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

// ===== تنظیمات =====
const TARGET_URL = process.env.TARGET_URL || 'https://pars77.store';

if (!TARGET_URL.startsWith('http')) {
    console.error("❌ TARGET_URL must start with https:// or http://");
    process.exit(1);
}

console.log(`✅ Target: ${TARGET_URL}`);
// ===================

const keepAliveAgent = new (TARGET_URL.startsWith('https') ? https.Agent : http.Agent)({
    keepAlive: true,
    maxSockets: 150,
    keepAliveMsecs: 3000,
});

const proxy = httpProxy.createProxyServer({
    target: TARGET_URL,
    changeOrigin: true,
    secure: true,                    // ← مهم: true بذار
    xfwd: true,
    agent: keepAliveAgent,
    proxyTimeout: 0,
    timeout: 0,
    followRedirects: true
});

// Error Handling بهتر
proxy.on('error', function (err, req, res) {
    console.error('Proxy Error:', err.code || err.message);
    if (res && res.writeHead) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Relay Error - Target unreachable');
    }
});

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('✅ Azure TURBO Relay is Alive!');
        return;
    }
    proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Turbo Relay running on port ${PORT}`);
});
