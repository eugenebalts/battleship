import WebSocket from 'ws';
import database from '../models/database';

const webSocketHandlers = (ws: WebSocket) => {
  ws.send('Successfully connected to WebSocket.');

  ws.addEventListener('message', (event) => {
    try {
      const parsedData = JSON.parse(event.data.toString());

      if (
        !(
          'type' in parsedData &&
          'data' in parsedData &&
          'id' in parsedData &&
          typeof parsedData.type === 'string' &&
          parsedData.data !== null &&
          typeof parsedData.data === 'object' &&
          parsedData.id === 0
        )
      ) {
        throw new Error('Bad request: Not enough or wrong fields.');
      }

      const { type, data, id } = parsedData;

      const response = {
        type,
        data,
        id,
      };

      switch (type) {
        case 'reg': {
          if (
            !(
              'name' in data &&
              'password' in data &&
              typeof data.name === 'string' &&
              typeof data.password === 'string'
            )
          ) {
            throw new Error('Bad request: Wrong request data.');
          }
          const loginUser = database.login(data);
          response.data = loginUser;

          break;
        }

        default:
          throw new Error('Bad request: Unknown type.');
      }

      ws.send(JSON.stringify(response));
    } catch (err) {
      ws.send(`${err}`);
    }
  });
};

export default webSocketHandlers;
