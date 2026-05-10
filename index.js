const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

const TARGET_URL = process.env.TARGET_URL || 'https://162.217.248.46:443';
const TARGET_SNI = 'bb12-eagsgvcpg2gedggh.uaenorth-01.azurewebsites.net';

console.log(`Target: ${TARGET_URL}`);

const keepAliveAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 150,
    servername: TARGET_SNI,  // ← این مهمه!
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
    headers: {
        'Host': TARGET_SNI
    }
});
