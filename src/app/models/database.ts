import { IPlayerData, ILoginResponse } from './types';

class Database {
  private players: IPlayerData[] = [];

  private findUser(name: string) {
    return this.players.findIndex((player) => {
      return player.name === name;
    });
  }

  public login(playerData: IPlayerData): ILoginResponse {
    const { name, password } = playerData;

    console.log(typeof name, typeof password);

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

  private register(playerData: IPlayerData) {
    const { name, password } = playerData;

    const newUser: IPlayerData = {
      name,
      password: password,
    };

    return this.players.push(newUser) - 1;
  }
}

export default new Database();
