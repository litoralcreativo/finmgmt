export abstract class FetchingFlag {
  private _fetching = false;
  public get fetching(): boolean {
    return this._fetching;
  }
  public set fetching(value: boolean) {
    this._fetching = value;
  }
}
