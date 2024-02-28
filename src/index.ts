import server from './services/server';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
server.httpServer.listen(HTTP_PORT);
