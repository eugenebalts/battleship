import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import http, { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import webSocketHandlers from '../app/controllers/websocketHandlers';
import path from 'path';
import fs from 'fs';

class Server {
  public app = express();
  private PORT = process.env.PORT || 3000;
  private SERVER_ERROR_MESSAGE = 'Internal Server Error';
  private httpServer!: http.Server;
  private wss!: WebSocketServer;

  constructor() {
    this.configureExpressApp();
    this.configureWebSocketServer();
    this.configureRoutes();
  }

  private configureExpressApp() {
    this.app.use(bodyParser.json());
  }

  private configureWebSocketServer() {
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

    this.httpServer.listen(this.PORT, () => {
      console.log(`Server is running on port ${this.PORT}`);
    });

    this.wss = new WebSocketServer({ server: this.httpServer });

    this.wss.on('connection', webSocketHandlers);
  }

  public configureRoutes() {
    this.app.use('/', (req: Request, res: Response) => {
      res.send('Hello world!');
    });
  }
}

export default new Server();
