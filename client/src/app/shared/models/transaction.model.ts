import { Account, AccountData } from './accountData.model';

export enum TransactionType {
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  PROFIT = 'profit',
  LOSS = 'loss',
}

/* export const TRANSACTION_TYPES: TransactionType[] = [TransactionType.TRANSFER]; */

export type BaseTransaction = {
  description: string;
  origin: string;
  destination: string;
};

export type WalletTransaction = BaseTransaction & {
  type:
    | TransactionType.TRANSFER
    | TransactionType.PAYMENT
    | TransactionType.PROFIT
    | TransactionType.LOSS;
};

export type BankTransaction = BaseTransaction & {
  type:
    | TransactionType.TRANSFER
    | TransactionType.PAYMENT
    | TransactionType.DEPOSIT
    | TransactionType.WITHDRAW;
};

export type CashTransaction = BaseTransaction & {
  type:
    | TransactionType.PAYMENT
    | TransactionType.DEPOSIT
    | TransactionType.WITHDRAW;
};

export type _Transaction =
  | WalletTransaction
  | BankTransaction
  | CashTransaction;

export class Transaction {
  origin?: Account;
  destination?: Account;

  constructor(origin?: Account, destination?: Account) {
    this.origin = origin;
    this.destination = destination;
    if (
      this.origin &&
      this.destination &&
      this.origin.data.symbol !== this.destination.data.symbol
    ) {
      throw new Error(
        `Origin(${this.origin.data.symbol}) and destination(${this.destination.data.symbol}) must have the same symbol`
      );
    }
  }

  /**
   * Sets the account where the transaction will impact
   * @param account the destination account
   * @returns if the destination was set
   */
  setDestination(account: Account): boolean {
    // if origin exist, and the symbol of both accounts are not the same, we must return false
    if (this.origin && this.origin.data.symbol !== account.data.symbol) {
      return false;
    }
    this.destination = account;
    return true;
  }

  /**
   * Set the account from where the transaction will be carried out
   * @param account the origin account
   * @returns if the origin was set
   */
  setOrigin(account: Account): boolean {
    // if origin exist, and the symbol of both accounts are not the same, we must return false
    if (
      this.destination &&
      this.destination.data.symbol !== account.data.symbol
    ) {
      return false;
    }
    this.origin = account;
    return true;
  }
}
