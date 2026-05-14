```js
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

const TARGET_URL =
    process.env.TARGET_URL ||
    'https://pars77.store';

const TARGET_SNI =
    'bb12-eagsgvcpg2gedggh.uaenorth-01.azurewebsites.net';

console.log(`Target: ${TARGET_URL}`);

const keepAliveAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 5000,
    maxSockets: 200,
    maxFreeSockets: 20,
    timeout: 0,
    servername: TARGET_SNI,
    rejectUnauthorized: false,
});

const proxy = httpProxy.createProxyServer({
    target: TARGET_URL,
    ws: true,
    xfwd: true,
    changeOrigin: true,
    secure: false,
    agent: keepAliveAgent,
    proxyTimeout: 0,
    timeout: 0,
    headers: {
        Host: TARGET_SNI,
        Connection: 'keep-alive',
    }
});

proxy.on('proxyReq', (proxyReq, req) => {
    proxyReq.setHeader('Host', TARGET_SNI);
});

proxy.on('proxyReqWs', (proxyReq, req) => {
    proxyReq.setHeader('Host', TARGET_SNI);
});

proxy.on('error', (err, req, res) => {
    console.error('Proxy Error:', err.code || err.message);

    if (res && !res.headersSent) {
        res.writeHead(502, {
            'Content-Type': 'text/plain'
        });

        res.end('Relay Error');
    }
});

const server = http.createServer((req, res) => {

    if (req.url === '/' || req.url === '') {

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end(
            'Azure XHTTP/WS Relay is Active & Unbuffered!'
        );

        return;
    }

    console.log(`HTTP ${req.method} ${req.url}`);

    proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {

    console.log(
        `WS Upgrade: ${req.url}`
    );

    proxy.ws(
        req,
        socket,
        head
    );
});

const PORT =
    process.env.PORT || 8080;

server.listen(PORT, () => {

    console.log(
        `✅ Turbo Relay running on port ${PORT}`
    );
});
```
