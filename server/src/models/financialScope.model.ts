import { ObjectIdType } from "./objectid.model";
import { z } from "zod";

export type FinancialScope = {
  _id: ObjectIdType;
  icon: string;
  name: string;
  creator: string;
  users: string[];
  shared: boolean;
  categories: Category[];
};

export type Category = {
  name: string;
  icon: string;
  fixed: boolean;
  default?: boolean;
};

export const FinancialScopeDTOSchema = z.object({
  name: z.string(),
  icon: z.string(),
  shared: z.boolean(),
});

export type FinancialScopeDTO = z.infer<typeof FinancialScopeDTOSchema>;
