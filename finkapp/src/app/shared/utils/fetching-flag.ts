export abstract class FetchingFlag {
  private _fetching: boolean = false;
  public get fetching(): boolean {
    return this._fetching;
  }
  public set fetching(value: boolean) {
    this._fetching = value;
  }

  constructor() {}
}
