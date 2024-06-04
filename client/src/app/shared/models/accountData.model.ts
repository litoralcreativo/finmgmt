export type AccountData = {
  name: string;
  type: AccountType;
  amount: number;
  symbol: string;
  favorite?: boolean;
};

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
