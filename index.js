const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

const TARGET_URL = process.env.TARGET_URL || 'http://162.217.248.46:443';

console.log(`Target: ${TARGET_URL}`);

const keepAliveAgent = new (TARGET_URL.startsWith('https') ? https.Agent : http.Agent)({
    keepAlive: true,
    maxSockets: 150,
});

const proxy = httpProxy.createProxyServer({
    target: TARGET_URL,
    changeOrigin: true,
    secure: false,           // ← فقط این خط موقتاً false است
    xfwd: true,
    agent: keepAliveAgent,
    proxyTimeout: 0,
    timeout: 0,
});

proxy.on('error', function (err, req, res) {
    console.error('Proxy Error:', err.code || err.message);
    if (res && res.writeHead) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Relay Error');
    }
});

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Azure XHTTP/WS Relay is Active & Unbuffered!');
        return;
    }
    proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
    console.log(`WebSocket Upgrade: ${req.url}`);
    proxy.ws(req, socket, head);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`✅ Turbo Relay running on port ${PORT}`);
});
