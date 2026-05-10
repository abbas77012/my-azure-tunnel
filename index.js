const http = require('http');
const https = require('https');
const url = require('url');

const TARGET_URL = 'http://162.217.248.46:443'; 

const server = http.createServer((req, res) => {
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
        console.error(`Problem with request: ${e.message}`);
        res.end();
    });

    req.pipe(proxyReq);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
