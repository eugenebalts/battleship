import { generateId } from '../../utils/generateId';
import { CellStatus, IPlayerData, IPublicUserData } from './types';

export default class Game {
  public idGame: string;
  public players: IPlayerData[] = [];

  constructor(roomUsers: IPublicUserData[]) {
    this.idGame = generateId();

    roomUsers.forEach((user) => this.addPlayer(user));
  }

  private addPlayer(user: IPublicUserData) {
    const idPlayer = generateId();

    const playerData: IPlayerData = {
      gameField: this.createField(),
      user,
      idPlayer,
    };

    this.players.push(playerData);

    return idPlayer;
  }

  private createField(): CellStatus[][] {
    const field: CellStatus[][] = [];

    for (let y = 0; y < 10; y++) {
      const row: CellStatus[] = [];

      for (let x = 0; x < 10; x++) {
        row.push(CellStatus.Empty);
      }

      field.push(row);
    }

    return field;
  }
}
