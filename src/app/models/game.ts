import { generateId } from '../../utils/generateId';
import { IPublicUserData } from './types';

export default class Game {
  public idGame: string;
  public players: Record<string, IPublicUserData> = {};

  constructor() {
    this.idGame = generateId();
  }

  public addUser(user: IPublicUserData) {
    const userId = generateId();

    this.players[userId] = user;

    return userId;
  }
}
