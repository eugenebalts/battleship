import { generateId } from '../../utils/generateId';
import {
  IGameRoom,
  ILoginData,
  ILoginResponse,
  IUserData,
  IWinners,
} from './types';
import User from './user';

class Database {
  private players: Record<string, User> = {};
  private gameRooms: IGameRoom[] = [];
  private winners: IWinners[] = [];
  private ranGames = [];

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
    const roomId = this.gameRooms.length;

    const newGameRoom: IGameRoom = {
      roomId,
      roomUsers: [this.players[userName].getPublicUserData()],
    };

    this.gameRooms.push(newGameRoom);

    return roomId;
  }

  public updateRooms() {
    const singleRooms = this.gameRooms.filter(
      (room) => room.roomUsers.length < 2
    );

    return singleRooms;
  }

  public updateWinners() {
    return this.winners;
  }

  public addPlayerToRoom(roomId: number, userName: string) {
    if (this.gameRooms[roomId] && this.gameRooms[roomId].roomUsers.length < 2) {
      this.gameRooms[roomId].roomUsers.push(this.players[userName]);

      if (this.gameRooms[roomId].roomUsers.length === 2) {
        return roomId;
      }
    }

    return new Error(`There are no available rooms with id ${roomId}`);
  }

  public createGame(roomId: number, user: IUserData) {
    const idGame = generateId();
    const idPlayer = generateId();
  }
}

export default new Database();
