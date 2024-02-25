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

export interface IGameRoom {
  roomId: number | string;
  roomUsers: IUserData[];
}

export interface IUserData {
  name: string | number | null;
  index: string | number | null;
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
