import http, { createServer } from 'http';
import { WebSocketServer } from 'ws';
import webSocketHandlers from '../app/controllers/websocketHandlers';
import path from 'path';
import fs from 'fs';

class Server {
  public httpServer!: http.Server;
  private wss!: WebSocketServer;

  constructor() {
    this.configureHttpServer();
    this.configureWebSocketServer();
  }

  private configureHttpServer() {
    this.httpServer = createServer((req, res) => {
      const __dirname = path.resolve(path.dirname(''));
      const file_path =
        __dirname +
        (req.url === '/' ? '/front/index.html' : '/front' + req.url);

      fs.readFile(file_path, function (err, data) {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200);
        res.end(data);
      });
    });
  }

  private configureWebSocketServer() {
    this.wss = new WebSocketServer({ port: 3000 });

    this.wss.on('connection', webSocketHandlers);
  }
}

export default new Server();
