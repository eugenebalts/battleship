import { generateId } from '../../utils/generateId';
import Game from './game';
import {
  ICreatedGameResponse,
  IGame,
  IGameRoom,
  ILoginData,
  ILoginResponse,
  IUserData,
  IWinners,
} from './types';
import User from './user';

class Database {
  private players: Record<string, User> = {};
  private gameRooms: Record<number, IGameRoom> = {};
  private winners: IWinners[] = [];

  private findUser(name: string): User | undefined {
    return this.players[name];
  }

  public login(playerData: ILoginData): ILoginResponse {
    const { name, password } = playerData;

    const user: User | undefined = this.findUser(name);

    if (user) {
      let error = false;
      let errorText = '';
      const index = user.index;

      if (!user.isCorrectPassword(password)) {
        error = true;
        errorText = 'Wrong password';
      }

      return {
        name,
        index,
        error,
        errorText,
      };
    } else {
      return this.register(playerData);
    }
  }

  private register(playerData: ILoginData) {
    const index = Object.keys(this.players).length;

    this.players[playerData.name] = new User(playerData, index);

    return this.login(playerData);
  }

  public createGameRoom(userName: string): number {
    const allRoomsId = Object.keys(this.gameRooms).map(Number);

    const newRoomId = allRoomsId.length
      ? allRoomsId[allRoomsId.length - 1] + 1
      : 0;

    const newGameRoom: IGameRoom = {
      roomId: newRoomId,
      roomUsers: [this.players[userName].getPublicUserData()],
      game: null,
    };

    this.gameRooms[newRoomId] = newGameRoom;

    return newRoomId;
  }

  public updateRooms() {
    const singleRooms = Object.values(this.gameRooms).filter(
      (room) => room.roomUsers.length < 2
    );

    return singleRooms;
  }

  public updateWinners() {
    return this.winners;
  }

  public addPlayerToRoom(
    roomId: number,
    userName: string
  ): ICreatedGameResponse | Error {
    const isRoomExists = this.gameRooms[roomId];
    const isRoomFree = this.gameRooms[roomId].roomUsers.length < 2;

    if (isRoomExists && isRoomFree) {
      this.gameRooms[roomId].roomUsers.push(
        this.players[userName].getPublicUserData()
      );

      if (this.gameRooms[roomId].roomUsers.length === 2) {
        return this.createGame(roomId, userName);
      }
    }

    return new Error(`There are no available rooms with id ${roomId}`);
  }

  public createGame(roomId: number, userName: string): ICreatedGameResponse {
    const userData = this.players[userName].getPublicUserData();

    let newGame = this.gameRooms[roomId].game;
    let userId;

    if (newGame) {
      userId = newGame.addUser(userData);
    } else {
      newGame = new Game();
      userId = newGame.addUser(userData);
    }

    return {
      idGame: newGame.idGame,
      idPlayer: userId,
    };
  }
}

export default new Database();
