import WebSocket from 'ws';
import database from '../models/database';
import { BodyTypes, IUserData } from '../models/types';
import Game from '../models/game';

interface IRoom {
  users: IRoomUser[];
}

interface IRoomUser {
  userIndex: number;
  websocket: WebSocket;
}

const connections: WebSocket[] = [];
const rooms: Record<string, IRoom> = {};

const webSocketHandlers = (ws: WebSocket) => {
  connections.push(ws);

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

      const { type } = parsedData;

      const data = parsedData(parsedData.data);

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

          const loginUserData = database.login(data);

          if (!loginUserData.error) {
            userData.name = loginUserData.name;
            userData.index = loginUserData.index;
            userData.isLogged = true;
          }

          sendPersonalResponse(type, loginUserData, ws);
          sendUpdatedRooms();
          sendUpdatedWinners();

          break;
        }

        case 'create_room': {
          const roomId = database.createGameRoom(userData.name!);

          const userIndex = userData.index;

          if (userIndex !== null) {
            rooms[roomId] = {
              users: [{ userIndex, websocket: ws }],
            };
          }

          sendUpdatedRooms();

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
          const isRoomFully = database.addPlayerToRoom(roomId, userData.name);

          if (!(isRoomFully instanceof Error)) {
            const userIndex = userData.index;

            if (userIndex !== null) {
              const roomUsers = rooms[roomId].users ?? [];

              roomUsers.push({ userIndex, websocket: ws });

              rooms[roomId] = {
                users: roomUsers,
              };
            }

            ws.send(JSON.stringify(rooms));

            if (isRoomFully) {
              const newGame = database.createGame(roomId);

              sendCreatedGame(roomId, newGame);
            }

            sendUpdatedRooms();
            sendUpdatedWinners();
          } else {
            throw new Error(isRoomFully.message);
          }

          break;
        }

        case 'add_ships':
          {
            if (!userData.name) throw new Error('At first login/register!');

            if (
              !('indexPlayer' in data) ||
              (typeof data.indexPlayer !== 'string' &&
                typeof data.indexPlayer !== 'number')
            ) {
              throw new Error('Bad request: Wrong request data (indexPlayer).');
            }

            if (
              !('gameId' in data) ||
              (typeof data.gameId !== 'string' &&
                typeof data.gameId !== 'number')
            ) {
              throw new Error('Bad request: Wrong request data (gameId).');
            }

            if (!('ships' in data) || !Array.isArray(data.ships)) {
              throw new Error('Bad request: Wrong request data (ships).');
            }

            if (data.ships.length < 4) {
              throw new Error(
                'Bad request: The request must contain 4 different ships - "small"|"medium"|"large"|"huge".'
              );
            }

            data.ships;

            const enableTypes = ['small', 'medium', 'large', 'huge'];

            const isCorrectShipFields: Boolean = data.ships.every(
              (ship: any) => {
                const isShipObject =
                  typeof ship === 'object' &&
                  ship !== null &&
                  ship !== undefined;

                const isPosition =
                  'position' in ship &&
                  typeof ship.position === 'object' &&
                  ship.position !== null &&
                  ship.position !== undefined;

                const isType =
                  'type' in ship && enableTypes.includes(ship.type);

                return isShipObject && isPosition && isType;
              }
            );

            if (!isCorrectShipFields) {
              throw new Error('Bad request. Wrong Ship fields');
            }
          }

          break;

        default:
          throw new Error('Bad request: Unknown type.');
      }
    } catch (err) {
      console.log(err);
      ws.send(`${err}`);
    }
  });

  const sendPersonalResponse = (
    type: BodyTypes,
    data: unknown,
    client: WebSocket
  ) => {
    const request = {
      type,
      data: JSON.stringify(data),
      id: 0,
    };

    const jsonRequest = JSON.stringify(request);

    return client.send(jsonRequest);
  };

  const sendResponseForAll = (type: BodyTypes, data: unknown) => {
    const request = {
      type,
      data: JSON.stringify(data),
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

  const sendCreatedGame = (roomId: number, game: Game) => {
    const type: BodyTypes = 'create_game';

    rooms[roomId].users.forEach((user) => {
      const client = user.websocket;
      const { userIndex } = user;

      const playerData = game.players.find(
        (player) => player.user.index === userIndex
      );

      if (playerData) {
        const { idGame } = game;
        const { idPlayer } = playerData;

        const data = {
          idGame,
          idPlayer,
        };

        sendPersonalResponse(type, data, client);
      }
    });
  };
};

export default webSocketHandlers;
