import { ILoginData } from './types';

export default class User {
  public name: string;
  private password: string;
  public index: number;
  public games = {};

  constructor(loginData: ILoginData, index: number) {
    this.name = loginData.name;
    this.password = loginData.password;
    this.index = index;
  }

  public isCorrectPassword(password: string) {
    return this.password === password;
  }

  public getPublicUserData() {
    return { name: this.name, index: this.index };
  }
}
