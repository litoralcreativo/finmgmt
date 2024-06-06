import {
  Account,
  AccountData,
  AccountType,
  ACCOUNT_TYPES,
} from './accountData.model';

export type TransactionType = 'incoming' | 'outgoing' | undefined;

export abstract class Transaction {
  private _description: string;
  public get description(): string {
    return this._description;
  }
  private _amount: number;
  public get amount(): number {
    return this._amount;
  }

  private _origin: Account;
  public get origin(): Account {
    return this._origin;
  }
  protected set origin(value: Account) {
    this._origin = value;
  }

  private _destination: Account;
  public get destination(): Account {
    return this._destination;
  }
  protected set destination(value: Account) {
    this._destination = value;
  }

  constructor() {}

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

  setDescription(description: string) {
    this._description = description;
  }
  setAmount(amount: number) {
    // If is an outgoing transaction and the value is positive, change the sign
    // because is a transaction where the origin is sending some money
    if (this.type === 'outgoing' && amount > 0) amount *= -1;
    this._amount = amount;
  }

  get symbol(): string {
    if (this.origin) return this.origin.data.symbol;
    if (this.destination) return this.destination.data.symbol;
    return 'ARS';
  }

  get type(): TransactionType {
    if (this.origin && !this.destination) return 'outgoing';
    if (!this.origin && this.destination) return 'incoming';
    return undefined;
  }
}

export class OutgoingTransaction extends Transaction {
  constructor(origin: Account) {
    super();
    this.origin = origin;
  }
}

export class IncomingTransaction extends Transaction {
  constructor(destination: Account) {
    super();
    this.destination = destination;
  }
}
