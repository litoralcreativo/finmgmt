export type AccountData = {
  name: string;
  type: AccountType;
  amount: number;
  symbol: string;
  favorite?: boolean;
};

export type AccountType = 'digital wallet' | 'cash' | 'bank account' | 'broker';
