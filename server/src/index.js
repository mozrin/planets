import { createServer } from 'node:http';

const port = Number(process.env.PORT ?? 3000);

createServer((request, response) => {
  if (request.url === '/api/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  response.writeHead(404, { 'content-type': 'application/json' });
  response.end(JSON.stringify({ error: 'Not found' }));
}).listen(port, '0.0.0.0', () => console.log(`Server listening on ${port}`));
