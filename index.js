const http = require('http');
const https = require('https');
const url = require('url');

const TARGET_URL = 'https://pars77.store'; 

const server = http.createServer((req, res) => {
    // نمایش پیام Active در صفحه اصلی
    if (req.url === '/' || req.url === '') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Azure XHTTP/WS Relay is Active & Unbuffered!');
        return;
    }

    const parsedUrl = url.parse(TARGET_URL);
    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            host: parsedUrl.hostname
        }
    };

    const proxyReq = (parsedUrl.protocol === 'https:' ? https : http).request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
        console.error(`Proxy Error: ${e.message}`);
        res.end();
    });

    req.pipe(proxyReq);
});

// بخش حیاتی: هندل کردن ارتقای پروتکل به WebSocket
server.on('upgrade', (req, socket, head) => {
    const parsedUrl = url.parse(TARGET_URL);
    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        method: req.method,
        path: req.url,
        headers: {
            ...req.headers,
            host: parsedUrl.hostname
        }
    };

    const proxyReq = (parsedUrl.protocol === 'https:' ? https : http).request(options);
    proxyReq.end();

    proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
        socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
                     Object.keys(proxyRes.headers).map(h => `${h}: ${proxyRes.headers[h]}`).join('\r\n') +
                     '\r\n\r\n');
        proxySocket.pipe(socket);
        socket.pipe(proxySocket);
    });

    proxyReq.on('error', (e) => {
        console.error(`WS Upgrade Error: ${e.message}`);
        socket.destroy();
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
