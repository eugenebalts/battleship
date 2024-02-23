import WebSocket from 'ws';

const webSocketHandlers = (ws: WebSocket) => {
  console.log('Client connected to WebSocket server');

  ws.addEventListener('message', (message) => {
    console.log('Received message: ', message.data);

    ws.send('hello from server side, Client! :)');
  });
};

export default webSocketHandlers;
