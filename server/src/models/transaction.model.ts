import { ObjectIdType } from "./objectid.model";

export type Transaction = {
  _id: ObjectIdType;
  user_id: string;
  account_id: string;
  amount: number;
  description: string;
  date: Date;
  scope: {
    _id: string;
    name: string;
    icon: string;
    category: {
      name: string;
      icon: string;
      fixed: boolean;
    };
  };
};

export type TransactionRequestDTO = {
  account_id: string;
  amount: number;
  description: string;
  date: Date;
  scope: {
    _id: string;
    category: {
      name: string;
    };
  };
};
