import { Db, ObjectId } from "mongodb";
import { Observable, from, throwError, forkJoin } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { FinancialScopeService } from "../financialScope.service";
import { TransactionService } from "../transaction.service";
import { UserService } from "../user.service";
import { AccountService } from "../account.service";
import { FinancialScope } from "../../models/financialScope.model";
import { Transaction } from "../../models/transaction.model";
import { User } from "../../models/user.model";
import PDFDocument from "pdfkit";
import * as ExcelJS from "exceljs";
import { IReport } from "./IReport.interface";
import { PdfReportService } from "./pdf-report.service";
import { ExcelReportService } from "./excel-report.service";

export interface MonthlyReportData {
  scope: FinancialScope;
  transactions: Transaction[];
  categoryAmounts: Array<{ _id: { name: string }; total: number }>;
  users: Map<string, User>; // Mapa de user_id -> User para acceso rápido
  accountSymbols: Map<string, string>; // Mapa de account_id -> symbol
  period: {
    year: number;
    month: number;
    from: Date;
    to: Date;
  };
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
}

export class ReportService {
  private financialScopeService: FinancialScopeService;
  private transactionService: TransactionService;
  private userService: UserService;
  private accountService: AccountService;
  pdfReportService: IReport;

  constructor(private db: Db) {
    this.financialScopeService = new FinancialScopeService(db);
    this.transactionService = new TransactionService(db);
    this.userService = new UserService(db);
    this.accountService = new AccountService(db);
  }

  generateMonthlyReport(
    scopeId: string,
    year: number,
    month: number,
    format: "pdf" | "excel"
  ): Observable<Buffer> {
    return this.getReportData(scopeId, year, month).pipe(
      mergeMap((data) => {
        switch (format) {
          case "pdf":
            this.pdfReportService = new PdfReportService();
            break;
          case "excel":
            this.pdfReportService = new ExcelReportService();
            break;
          default:
            throw new Error("Formato no soportado");
        }

        return this.pdfReportService.generateReport(data);
      })
    );
  }

  private getReportData(
    scopeId: string,
    year: number,
    month: number
  ): Observable<MonthlyReportData & { accountSymbols: Map<string, string> }> {
    const from = new Date(year, month);
    const to = new Date(year, month + 1);
    to.setMinutes(to.getMinutes() - 1);

    return this.financialScopeService.getById(scopeId).pipe(
      mergeMap((scope) => {
        if (!scope) {
          return throwError(new Error("Scope not found"));
        }

        return this.transactionService
          .getAll(
            { page: 0, pageSize: 10000 }, // Obtener todas las transacciones
            {
              "scope._id": scopeId,
              date: { $gte: from, $lte: to },
            },
            { date: -1 }
          )
          .pipe(
            mergeMap((transactions) => {
              const userIds = [
                ...new Set(transactions.elements.map((t) => t.user_id)),
              ];
              const accountIds = [
                ...new Set(transactions.elements.map((t) => t.account_id)),
              ];
              const objectAccountIds = accountIds.map((id) => new ObjectId(id));
              const accounts$ = this.accountService.getAll(undefined, {
                _id: { $in: objectAccountIds },
              });

              // Si no hay transacciones o es un scope personal, no necesitamos usuarios
              if (userIds.length === 0 || !scope.shared) {
                return forkJoin([
                  accounts$,
                  this.transactionService.getCategoryAmountsByScope(scopeId, {
                    from,
                    to,
                  }),
                ]).pipe(
                  map(
                    ([accountsResult, categoryAmounts]): MonthlyReportData => {
                      const accountSymbols = new Map<string, string>();
                      (accountsResult.elements || accountsResult).forEach(
                        (acc: any) => {
                          accountSymbols.set(acc._id.toString(), acc.symbol);
                        }
                      );

                      return {
                        scope,
                        transactions: transactions.elements,
                        categoryAmounts,
                        users: new Map(), // Mapa vacío para scopes personales
                        accountSymbols,
                        period: { year, month, from, to },
                        totalTransactions: transactions.elements.length,
                        totalIncome: transactions.elements
                          .filter((t) => t.amount > 0)
                          .reduce((sum, t) => sum + t.amount, 0),
                        totalExpenses: Math.abs(
                          transactions.elements
                            .filter((t) => t.amount < 0)
                            .reduce((sum, t) => sum + t.amount, 0)
                        ),
                      };
                    }
                  )
                );
              }

              // Para scopes compartidos, obtener información de usuarios
              const userObservables = userIds.map((userId) =>
                this.userService.getById(userId)
              );

              return forkJoin(userObservables).pipe(
                mergeMap((users) => {
                  // Crear mapa de usuarios
                  const userMap = new Map<string, User>();
                  users.forEach((user, index) => {
                    if (user) {
                      userMap.set(userIds[index], user);
                    }
                  });

                  return accounts$.pipe(
                    mergeMap((accountsResult: any) => {
                      const accountSymbols = new Map<string, string>();
                      (accountsResult.elements || accountsResult).forEach(
                        (acc: any) => {
                          accountSymbols.set(acc._id.toString(), acc.symbol);
                        }
                      );

                      return this.transactionService
                        .getCategoryAmountsByScope(scopeId, { from, to })
                        .pipe(
                          map(
                            (categoryAmounts): MonthlyReportData => ({
                              scope,
                              transactions: transactions.elements,
                              categoryAmounts,
                              users: userMap,
                              accountSymbols,
                              period: { year, month, from, to },
                              totalTransactions: transactions.elements.length,
                              totalIncome: transactions.elements
                                .filter((t) => t.amount > 0)
                                .reduce((sum, t) => sum + t.amount, 0),
                              totalExpenses: Math.abs(
                                transactions.elements
                                  .filter((t) => t.amount < 0)
                                  .reduce((sum, t) => sum + t.amount, 0)
                              ),
                            })
                          )
                        );
                    })
                  );
                })
              );
            })
          );
      })
    );
  }
}
