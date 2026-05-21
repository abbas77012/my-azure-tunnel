const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

const TARGET_URL = process.env.TARGET_URL || 'https://iran1405.lifestyle';
const TARGET_SNI = 'bb12-eagsgvcpg2gedggh.uaenorth-01.azurewebsites.net';

console.log(`Target: ${TARGET_URL}`);

const keepAliveAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 150,
    servername: TARGET_SNI,
    rejectUnauthorized: false,
});

const proxy = httpProxy.createProxyServer({
    target: TARGET_URL,
    changeOrigin: true,
    secure: false,
    xfwd: true,
    agent: keepAliveAgent,
    proxyTimeout: 0,
    timeout: 0,
    headers: { 'Host': TARGET_SNI }
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
