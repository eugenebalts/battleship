import WebSocket from 'ws';
import database from '../models/database';
import { BodyTypes, IUserData } from '../models/types';

const connections: WebSocket[] = [];

const webSocketHandlers = (ws: WebSocket) => {
  connections.push(ws);

  ws.send('Successfully connected to WebSocket.');
  const userData: IUserData = {
    name: null,
    index: null,
    isLogged: false,
  };

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
          parsedData.id === 0
        )
      ) {
        throw new Error('Bad request: Not enough or wrong fields.');
      }

      const { type, data, id } = parsedData;

      switch (type) {
        case 'reg': {
          if (userData.isLogged) return ws.send('You are already logged!');

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

          const loginUserData = database.login(data);

          if (!loginUserData.error) {
            userData.name = loginUserData.name;
            userData.index = loginUserData.index;
            userData.isLogged = true;
          }

          ws.send('Successfully logged!');
          sendPersonalResponse(type, loginUserData);
          sendUpdatedRooms();
          sendUpdatedWinners();

          break;
        }

        case 'create_room': {
          if (userData.name) {
            const roomId = database.createGameRoom(userData.name);

            ws.send(`Room has been successfully created with id (${roomId})`);

            sendUpdatedRooms();
          } else {
            throw new Error('At first login/register!');
          }

          break;
        }

        case 'add_user_to_room': {
          if (!userData.name) throw new Error('At first login/register!');

          if (
            !('indexRoom' in data) ||
            (typeof data.indexRoom !== 'string' &&
              typeof data.indexRoom !== 'number')
          ) {
            throw new Error('Bad request: Wrong request data.');
          }

          const roomId = Number(data.indexRoom);
          const addUserToRoom = database.addPlayerToRoom(roomId, userData.name);

          if (!(addUserToRoom instanceof Error)) {
            ws.send(`Successfully connected to room with id (${roomId})`);

            sendUpdatedRooms();
          } else {
            throw new Error(addUserToRoom.message);
          }

          break;
        }

        default:
          throw new Error('Bad request: Unknown type.');
      }
    } catch (err) {
      ws.send(`${err}`);
    }
  });

  const sendPersonalResponse = (type: BodyTypes, data: unknown) => {
    const request = {
      type,
      data,
      id: 0,
    };

    return ws.send(JSON.stringify(request));
  };

  const sendResponseForAll = (type: BodyTypes, data: unknown) => {
    const request = {
      type,
      data,
      id: 0,
    };

    connections.forEach((client) => {
      client.send(JSON.stringify(request));
    });
  };

  const sendUpdatedRooms = () => {
    const updatedRooms = database.updateRooms();

    return sendResponseForAll('update_room', updatedRooms);
  };

  const sendUpdatedWinners = () => {
    const updatedWinners = database.updateWinners();

    return sendResponseForAll('update_winners ', updatedWinners);
  };
};

export default webSocketHandlers;
