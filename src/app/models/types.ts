interface IStaticPlayerRequest {
  type: 'reg';
  id: 0;
}

export type IPlayerData = {
  name: string;
  password: string;
};

export interface ILoginResponse {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

export interface IPlayerRequest extends IStaticPlayerRequest {
  data: IPlayerData;
}
export interface IPlayerResponse extends IStaticPlayerRequest {
  data: ILoginResponse;
}
