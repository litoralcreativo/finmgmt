import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import {
  Account,
  AccountData,
  AccountType,
  ACCOUNT_TYPES,
} from './accountData.model';
import { Category } from './category.model';
import { Scope, ScopedCategory } from './scope.model';

export type TransactionType = 'incoming' | 'outgoing' | undefined;

export abstract class Transaction {
  madeTransaction?: TransactionResponse;

  private _scope: ScopedCategory;
  public get scope(): ScopedCategory {
    return this._scope;
  }

  private _category: Category;
  public get category(): Category {
    return this._category;
  }

  private _description: string;
  public get description(): string {
    return this._description;
  }

  private _date: Date;
  public get date(): Date {
    return this._date;
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
    if (typeof amount !== 'number') throw new Error('Amount must be a number');

    if (this.type === 'outgoing' && amount > 0)
      // If is an outgoing transaction and the value is positive, change the sign
      // because is a transaction where the origin is sending some money
      amount *= -1;
    this._amount = amount;
  }

  setDate(date: Date) {
    if (!(date instanceof Date) || isNaN(date.getTime()))
      throw new Error('parameter must be a date');

    this._date = date;
  }

  setScope(scope: ScopedCategory) {
    this._scope = scope;
  }

  setCategory(category: Category) {
    this._category = category;
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

  generateRequest(): TransactionRequestDTO {
    if (!this.origin && !this.destination)
      throw new Error('No origin or destination set');

    const accountId = this.origin?.data._id || this.destination?.data._id;

    let tranReq: TransactionRequestDTO = {
      account_id: accountId,
      amount: this.amount,
      description: this.description ?? '',
      date: this.date.toISOString(),
      scope: {
        _id: this.scope._id,
        category: {
          name: this.category.name,
        },
      },
    };
    return tranReq;
  }

  generateModificationRequest(): ModifiedTransactionRequestDTO {
    return {
      amount: this.amount,
      description: this.description ?? '',
      scope: {
        _id: this.scope._id,
        category: {
          name: this.category.name,
        },
      },
    };
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

export type TransactionFilterRequest = {
  description: string;
  category: string;
};

export type TransactionResponse = {
  _id: string;
  user_id: string;
  account_id: string;
  amount: number;
  description: string;
  date: Date;
  scope: ScopedCategory;
};

export type TransactionRequestDTO = {
  account_id: string;
  amount: number;
  description: string;
  date: string;
  scope: {
    _id: string;
    category: {
      name: string;
    };
  };
};

export type ModifiedTransactionRequestDTO = {
  amount: number;
  description: string;
  scope: {
    _id: string;
    category: {
      name: string;
    };
  };
};
