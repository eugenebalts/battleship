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
      roomUsers: [],
      game: null,
    };

    this.gameRooms[newRoomId] = newGameRoom;

    this.addPlayerToRoom(newRoomId, userName);

    return newRoomId;
  }

  public updateRooms() {
    const singleRooms = Object.values(this.gameRooms).filter(
      (room) => room.roomUsers.length < 2
    );

    return singleRooms.map((room) => {
      const { roomId, roomUsers } = room;

      return {
        roomId,
        roomUsers,
      };
    });
  }

  public updateWinners() {
    return this.winners;
  }

  public addPlayerToRoom(roomId: number, userName: string): Boolean | Error {
    const isRoomExists = roomId in this.gameRooms;
    const isRoomFree = this.gameRooms[roomId].roomUsers.length < 2;

    if (isRoomExists && isRoomFree) {
      this.gameRooms[roomId].roomUsers.push(
        this.players[userName].getPublicUserData()
      );

      if (this.gameRooms[roomId].roomUsers.length === 2) {
        return true;
      }
    }

    return new Error(`There are no available rooms with id ${roomId}`);
  }

  public createGame(roomId: number): Game {
    const roomUsers = this.gameRooms[roomId].roomUsers;

    const newGame = new Game(roomUsers);

    return newGame;
  }
}

export default new Database();
