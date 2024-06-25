export type Balance = {
  days: number;
  from: Date;
  to: Date;
  data: BalanceData[];
};

export type BalanceData = {
  day: Date;
  totalAmount: number;
};
