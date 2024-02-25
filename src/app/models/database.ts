import {
  IGameRoom,
  ILoginData,
  ILoginResponse,
  IUserData,
  IWinners,
} from './types';

class Database {
  private players: ILoginData[] = [];
  private gameRooms: IGameRoom[] = [];
  private winners: IWinners[] = [];

  private findUser(name: string): number {
    return this.players.findIndex((player) => {
      return player.name === name;
    });
  }

  public login(playerData: ILoginData): ILoginResponse {
    const { name, password } = playerData;

    const playerIndex = this.findUser(name);
    let index = playerIndex;
    let error = false;
    let errorText = '';

    if (playerIndex !== -1) {
      if (this.players[playerIndex].password !== password) {
        error = true;
        errorText = 'Wrong password';
      }
    } else {
      index = this.register(playerData);
    }

    return {
      name,
      index,
      error,
      errorText,
    };
  }

  private register(playerData: ILoginData): number {
    const { name, password } = playerData;

    const newUser: ILoginData = {
      name,
      password: password,
    };

    return this.players.push(newUser) - 1;
  }

  public createGameRoom(user: IUserData): number {
    const roomId = this.gameRooms.length;

    const newGameRoom: IGameRoom = {
      roomId,
      roomUsers: [user],
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
}

export default new Database();
