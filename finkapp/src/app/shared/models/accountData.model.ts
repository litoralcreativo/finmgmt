export enum AccountType {
  DIGITAL_WALLET = 'digital wallet',
  CASH = 'cash',
  BANK_ACCOUNT = 'bank account',
  BROKER = 'broker',
}

export const ACCOUNT_TYPES: AccountType[] = [
  AccountType.DIGITAL_WALLET,
  AccountType.BANK_ACCOUNT,
  AccountType.BROKER,
  AccountType.CASH,
];

export interface AccountData {
  _id: string;
  user_id: string;
  name: string;
  type: AccountType;
  amount: number;
  symbol: string;
  favorite?: boolean;
  shared_with?: string[];
};

export class Account {
  private _data: AccountData;
  public get data(): AccountData {
    return this._data;
  }

  constructor(data: AccountData) {
    this._data = data;
  }

  favorite(state: boolean) {
    this.data.favorite = state;
  }

  public get shared(): boolean {
    return Boolean(this._data.shared_with);
  }
}
