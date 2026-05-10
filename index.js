const http = require('http');
const httpProxy = require('http-proxy');

const TARGET_URL = 'https://pars77.store'; 

const keepAliveAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 100,
  keepAliveMsecs: 3000,
});

const proxy = httpProxy.createProxyServer({
  target: TARGET_URL,
  changeOrigin: true,
  secure: false,
  xfwd: true,
  agent: keepAliveAgent,
  proxyTimeout: 0,
  timeout: 0,
});

proxy.on('error', function (err, req, res) {
  if (res && res.writeHead) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Relay Error.');
  }
});

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Azure TURBO Relay is Alive!');
    return;
  }
  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Turbo Relay running on port ${PORT}`);
});
