import Game from './game';

interface ILoginStaticRequest {
  type: 'reg';
  id: 0;
}

export interface ILoginData {
  name: string;
  password: string;
}

export interface ILoginResponse {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

export interface ILoginRequest extends ILoginStaticRequest {
  data: ILoginData;
}
export interface IPlayerResponse extends ILoginStaticRequest {
  data: ILoginResponse;
}

export interface ICreatedGameResponse {
  idGame: string;
  idPlayer: string;
}

export interface IGameRoom {
  roomId: number | string;
  roomUsers: IPublicUserData[];
  game: Game | null;
}

export interface IPublicUserData {
  name: string;
  index: number;
}

export interface IGame {
  idGame: string;
  gameField: string;
  players: Record<string, IPublicUserData>;
}

export enum CellStatus {
  Empty,
  Occupied,
  Hit,
  Miss,
}

export interface IPlayerData {
  gameField: CellStatus[][];
  user: IPublicUserData;
  idPlayer: string;
}

export interface IUserData {
  name: string | null;
  index: number | null;
  isLogged: boolean;
}

export type BodyTypes =
  | 'reg'
  | 'update_room'
  | 'update_winners '
  | 'create_game'
  | 'start_game'
  | 'turn'
  | 'attack'
  | 'finish';

export interface IWinners {
  name: string;
  wins: number;
}
