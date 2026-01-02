import { Db, ObjectId } from "mongodb";
import { Observable, from, throwError, forkJoin } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { FinancialScopeService } from "./financialScope.service";
import { TransactionService } from "./transaction.service";
import { UserService } from "./user.service";
import { AccountService } from "./account.service";
import { FinancialScope } from "../models/financialScope.model";
import { Transaction } from "../models/transaction.model";
import { User } from "../models/user.model";
import PDFDocument from "pdfkit";
import * as ExcelJS from "exceljs";

interface MonthlyReportData {
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
        if (format === "pdf") {
          return this.generatePDFReport(data);
        } else {
          return this.generateExcelReport(data);
        }
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

  private generatePDFReport(data: MonthlyReportData): Observable<Buffer> {
    return new Observable((observer) => {
      try {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        // Definir colores una sola vez
        const colors = {
          black: "#000000",
          income: "#2d7d32", // Verde oscuro para ingresos
          expense: "#c62828", // Rojo oscuro para gastos
        };

        // Función helper para formatear moneda con 2 decimales
        const formatCurrency = (amount: number): string => {
          return amount.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        };

        // Función helper para formatear fecha en formato dd/MM/yyyy
        const formatDate = (date: Date): string => {
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          observer.next(pdfBuffer);
          observer.complete();
        });

        // Header del reporte
        doc.fontSize(20);

        // Calcular el ancho del texto para centrarlo correctamente
        const titleText = "Reporte Mensual - ";
        const titleWidth = doc.widthOfString(titleText);
        const scopeNameWidth = doc.widthOfString(data.scope.name);
        const totalWidth = titleWidth + scopeNameWidth;
        const pageWidth = doc.page.width;
        const startX = (pageWidth - totalWidth) / 2;

        // Escribir el texto en partes con posicionamiento manual
        doc.text(titleText, startX, doc.y, { continued: false });
        doc
          .font("Helvetica-Bold")
          .text(data.scope.name, startX + titleWidth, doc.y - 23, {
            continued: false,
          })
          .font("Helvetica");

        doc.moveDown();

        const monthNames = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ];

        doc.fontSize(16);

        // Calcular el ancho del texto del período para centrarlo correctamente
        const periodText = "Período: ";
        const periodLabelWidth = doc.widthOfString(periodText);
        const periodValueText = `${monthNames[data.period.month]} ${
          data.period.year
        }`;
        const periodValueWidth = doc.widthOfString(periodValueText);
        const totalPeriodWidth = periodLabelWidth + periodValueWidth;
        const periodStartX = (pageWidth - totalPeriodWidth) / 2;

        // Escribir el período en partes con posicionamiento manual
        doc.text(periodText, periodStartX, doc.y, { continued: false });
        doc
          .font("Helvetica-Bold")
          .text(periodValueText, periodStartX + periodLabelWidth, doc.y - 18, {
            continued: false,
          })
          .font("Helvetica");
        doc.moveDown(2);

        // Resumen financiero
        doc.fontSize(14);
        doc.text("Resumen Financiero:", 50, doc.y, { underline: true });
        doc.moveDown(0.5);

        const summaryLeftMargin = 80;
        const resumenRowHeight = 18;
        // Obtener todos los símbolos únicos presentes en ingresos, gastos o transacciones
        const resumenSymbols = Array.from(
          new Set([
            ...data.transactions.map(
              (t) => data.accountSymbols.get(t.account_id) || ""
            ),
          ])
        ).filter(Boolean);
        // Definir columnas: primera columna fija, luego una por símbolo
        const resumenColWidths = [180, ...resumenSymbols.map(() => 90)];
        const resumenStartX = summaryLeftMargin;
        let resumenTableY = doc.y;

        // Header
        doc.fontSize(11).font("Helvetica-Bold");
        doc.text("", resumenStartX, resumenTableY, {
          width: resumenColWidths[0],
        });
        resumenSymbols.forEach((symbol, i) => {
          doc.text(
            symbol,
            resumenStartX +
              resumenColWidths.slice(0, i + 1).reduce((a, b) => a + b, 0),
            resumenTableY,
            {
              width: resumenColWidths[i + 1],
              align: "right",
            }
          );
        });
        resumenTableY += resumenRowHeight;
        doc.font("Helvetica");

        // Helper para obtener valores por símbolo
        // Ingresos por símbolo
        const incomeBySymbol = new Map<string, number>();
        // Gastos por símbolo
        const expenseBySymbol = new Map<string, number>();
        // Balance por símbolo
        const balanceBySymbol = new Map<string, number>();
        // Transacciones por símbolo
        const transCountBySymbol = new Map<string, number>();
        data.transactions.forEach((t) => {
          const symbol = data.accountSymbols.get(t.account_id) || "";
          if (!resumenSymbols.includes(symbol)) return;
          if (t.amount > 0) {
            incomeBySymbol.set(
              symbol,
              (incomeBySymbol.get(symbol) || 0) + t.amount
            );
          } else if (t.amount < 0) {
            expenseBySymbol.set(
              symbol,
              (expenseBySymbol.get(symbol) || 0) + t.amount
            );
          }
          transCountBySymbol.set(
            symbol,
            (transCountBySymbol.get(symbol) || 0) + 1
          );
        });
        resumenSymbols.forEach((symbol) => {
          balanceBySymbol.set(
            symbol,
            (incomeBySymbol.get(symbol) || 0) +
              (expenseBySymbol.get(symbol) || 0)
          );
        });

        // Filas: nombre, valores por símbolo
        const resumenRows = [
          {
            label: "Total de Ingresos",
            map: incomeBySymbol,
            color: colors.income,
          },
          {
            label: "Total de Gastos",
            map: expenseBySymbol,
            color: colors.expense,
          },
          { label: "Balance", map: balanceBySymbol, color: null },
          {
            label: "Total de Transacciones",
            map: transCountBySymbol,
            color: null,
            isCount: true,
          },
        ];
        resumenRows.forEach((row, idx) => {
          doc.fontSize(11).font("Helvetica").fillColor(colors.black);
          doc.text(row.label, resumenStartX, resumenTableY, {
            width: resumenColWidths[0],
          });
          resumenSymbols.forEach((symbol, i) => {
            let value = row.map.get(symbol) || 0;
            let text = row.isCount ? value.toString() : formatCurrency(value);
            let color = row.color;
            if (row.label === "Balance") {
              color = value >= 0 ? colors.income : colors.expense;
            }
            const cellX =
              resumenStartX +
              resumenColWidths.slice(0, i + 1).reduce((a, b) => a + b, 0);
            doc
              .fillColor(color || colors.black)
              .text(text, cellX, resumenTableY, {
                width: resumenColWidths[i + 1],
                align: "right",
              })
              .fillColor(colors.black);
          });
          resumenTableY += resumenRowHeight;
          // Dibujar línea después de Total de Gastos
          if (row.label === "Total de Gastos") {
            doc
              .moveTo(resumenStartX, resumenTableY - 4)
              .lineTo(
                resumenStartX + resumenColWidths.reduce((a, b) => a + b, 0),
                resumenTableY - 4
              )
              .lineWidth(1)
              .strokeColor("#888888")
              .stroke()
              .strokeColor(colors.black)
              .lineWidth(0.5);
          }
        });
        doc.y = resumenTableY + 8;
        doc.moveDown(1);

        // Gastos por categoría en formato tabla
        if (data.categoryAmounts.length > 0) {
          doc.fontSize(14);
          doc.text("Gastos por Categoría:", 50, doc.y, { underline: true });
          doc.moveDown(0.5);

          const catStartX = summaryLeftMargin;
          const catRowHeight = 18;
          const catColWidths = [180, ...resumenSymbols.map(() => 90)];
          let catTableY = doc.y;

          // Header
          doc.fontSize(11).font("Helvetica-Bold");
          doc.text("", catStartX, catTableY, { width: catColWidths[0] });
          resumenSymbols.forEach((symbol, i) => {
            doc.text(
              symbol,
              catStartX +
                catColWidths.slice(0, i + 1).reduce((a, b) => a + b, 0),
              catTableY,
              {
                width: catColWidths[i + 1],
                align: "right",
              }
            );
          });
          catTableY += catRowHeight;
          doc.font("Helvetica");

          // Filas por categoría
          data.categoryAmounts
            .sort((a, b) => a.total - b.total)
            .forEach((cat) => {
              if (cat.total < 0) {
                doc.fontSize(11).fillColor(colors.black);
                doc.text(cat._id.name, catStartX, catTableY, {
                  width: catColWidths[0],
                });
                // Agrupar por símbolo de moneda y sumar
                const transaccionesCat = data.transactions.filter(
                  (t) =>
                    t.amount < 0 && t.scope?.category?.name === cat._id.name
                );
                const symbolTotals = new Map<string, number>();
                transaccionesCat.forEach((t) => {
                  const symbol = data.accountSymbols.get(t.account_id) || "";
                  symbolTotals.set(
                    symbol,
                    (symbolTotals.get(symbol) || 0) + Math.abs(t.amount)
                  );
                });
                resumenSymbols.forEach((symbol, i) => {
                  const value = symbolTotals.get(symbol) || 0;
                  const cellX =
                    catStartX +
                    catColWidths.slice(0, i + 1).reduce((a, b) => a + b, 0);
                  doc
                    .fillColor(colors.expense)
                    .text(
                      value ? formatCurrency(value) : "-",
                      cellX,
                      catTableY,
                      { width: catColWidths[i + 1], align: "right" }
                    )
                    .fillColor(colors.black);
                });
                catTableY += catRowHeight;
              }
            });
          doc.y = catTableY + 8;
          doc.moveDown(1);
        }

        // Lista de transacciones
        doc.fontSize(14);
        doc.text("Transacciones:", 50, doc.y, { underline: true });
        doc.moveDown(0.5);

        // Headers de la tabla
        const leftMargin = 50;
        const dateWidth = 80;
        const categoryWidth = 120;
        const descriptionWidth = data.scope.shared ? 140 : 180; // Menos espacio para descripción si hay usuario
        const userWidth = data.scope.shared ? 60 : 0; // Solo mostrar columna de usuario si es compartido
        const amountWidth = 80;
        const currencyWidth = 50; // Ancho para la columna de moneda

        const currentY = doc.y;

        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text("Fecha", leftMargin, currentY)
          .text("Categoría", leftMargin + dateWidth, currentY)
          .text(
            "Descripción",
            leftMargin + dateWidth + categoryWidth,
            currentY
          );

        if (data.scope.shared) {
          doc.text(
            "Usuario",
            leftMargin + dateWidth + categoryWidth + descriptionWidth,
            currentY
          );
        }

        doc.text(
          "Monto",
          leftMargin + dateWidth + categoryWidth + descriptionWidth + userWidth,
          currentY,
          { align: "right", width: amountWidth }
        );

        // Nueva columna para la moneda
        doc.text(
          "Moneda",
          leftMargin +
            dateWidth +
            categoryWidth +
            descriptionWidth +
            userWidth +
            amountWidth,
          currentY,
          { align: "right", width: currencyWidth }
        );

        doc.moveDown(0.3);

        // Línea separadora
        doc
          .moveTo(leftMargin, doc.y)
          .lineTo(
            leftMargin +
              dateWidth +
              categoryWidth +
              descriptionWidth +
              userWidth +
              amountWidth +
              currencyWidth,
            doc.y
          )
          .stroke();

        doc.moveDown(0.3);

        data.transactions.forEach((transaction, index: number) => {
          const date = formatDate(new Date(transaction.date));
          const category = transaction.scope?.category?.name || "Sin categoría";
          const description =
            transaction.description.length > (data.scope.shared ? 20 : 25)
              ? transaction.description.substring(
                  0,
                  data.scope.shared ? 20 : 25
                ) + "..."
              : transaction.description;
          const amount =
            transaction.amount > 0
              ? `+ ${formatCurrency(transaction.amount)}`
              : `- ${formatCurrency(Math.abs(transaction.amount))}`;

          // Obtener el nombre del usuario si es un scope compartido
          const userDisplay = data.scope.shared
            ? (() => {
                const user = data.users.get(transaction.user_id);
                if (user && user.name.first) {
                  return user.name.first.substring(0, 3).toUpperCase();
                }
                return transaction.user_id.substring(0, 3).toUpperCase();
              })()
            : "";

          const currentY = doc.y;

          // Definir color basado en el tipo de transacción
          const textColor =
            transaction.amount > 0 ? colors.income : colors.expense;

          doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor(colors.black) // Negro para fecha, categoría y descripción
            .text(date, leftMargin, currentY)
            .text(category, leftMargin + dateWidth, currentY)
            .text(
              description,
              leftMargin + dateWidth + categoryWidth,
              currentY
            );

          if (data.scope.shared) {
            doc.text(
              userDisplay,
              leftMargin + dateWidth + categoryWidth + descriptionWidth,
              currentY
            );
          }

          doc
            .fillColor(textColor) // Color específico para el monto
            .text(
              amount,
              leftMargin +
                dateWidth +
                categoryWidth +
                descriptionWidth +
                userWidth,
              currentY,
              { align: "right", width: amountWidth }
            )
            .fillColor(colors.black); // Restaurar color negro para la siguiente iteración

          // Mostrar el símbolo de la moneda con espacio extra
          const currencySymbol =
            data.accountSymbols.get(transaction.account_id) || "";
          const currencyOffset = 10; // Espacio en px entre amount y currency
          doc
            .fillColor(textColor)
            .text(
              currencySymbol,
              leftMargin +
                dateWidth +
                categoryWidth +
                descriptionWidth +
                userWidth +
                amountWidth +
                currencyOffset,
              currentY,
              { align: "left", width: currencyWidth }
            )
            .fillColor(colors.black);

          doc.moveDown(0.4);

          // Agregar nueva página si es necesario
          if (doc.y > 700) {
            doc.addPage();
          }
        });

        doc.end();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  private generateExcelReport(data: MonthlyReportData): Observable<Buffer> {
    return new Observable((observer) => {
      try {
        const workbook = new ExcelJS.Workbook();

        // Función helper para formatear fecha en formato dd/MM/yyyy
        const formatDate = (date: Date): string => {
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        // Hoja de resumen
        const summarySheet = workbook.addWorksheet("Resumen");
        const monthNames = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ];

        summarySheet.mergeCells("A1:D1");
        summarySheet.getCell(
          "A1"
        ).value = `Reporte Mensual - ${data.scope.name}`;
        summarySheet.getCell("A1").font = { size: 16, bold: true };
        summarySheet.getCell("A1").alignment = { horizontal: "center" };

        // Aplicar negrita solo al nombre del scope
        summarySheet.getCell("A1").value = {
          richText: [
            { text: "Reporte Mensual - " },
            { text: data.scope.name, font: { bold: true, size: 16 } },
          ],
        };

        summarySheet.mergeCells("A2:D2");
        summarySheet.getCell("A2").value = `Período: ${
          monthNames[data.period.month]
        } ${data.period.year}`;
        summarySheet.getCell("A2").alignment = { horizontal: "center" };

        // Aplicar negrita solo al período (mes y año)
        summarySheet.getCell("A2").value = {
          richText: [
            { text: "Período: " },
            {
              text: `${monthNames[data.period.month]} ${data.period.year}`,
              font: { bold: true },
            },
          ],
        };

        summarySheet.getCell("A4").value = "Resumen Financiero";
        summarySheet.getCell("A4").font = { bold: true };

        summarySheet.getCell("A5").value = "Total de Ingresos:";
        summarySheet.getCell("B5").value = data.totalIncome;
        summarySheet.getCell("A6").value = "Total de Gastos:";
        summarySheet.getCell("B6").value = data.totalExpenses;
        summarySheet.getCell("A7").value = "Balance:";
        summarySheet.getCell("B7").value =
          data.totalIncome - data.totalExpenses;
        summarySheet.getCell("A8").value = "Total de Transacciones:";
        summarySheet.getCell("B8").value = data.totalTransactions;

        // Hoja de transacciones
        const transactionsSheet = workbook.addWorksheet("Transacciones");

        // Definir columnas dinámicamente según si el scope es compartido
        const columns = [
          { header: "Fecha", key: "date", width: 12 },
          { header: "Descripción", key: "description", width: 30 },
          { header: "Categoría", key: "category", width: 15 },
        ];

        if (data.scope.shared) {
          columns.push({ header: "Usuario", key: "user", width: 10 });
        }

        columns.push({ header: "Monto", key: "amount", width: 15 });
        columns.push({ header: "Moneda", key: "currency", width: 10 }); // Nueva columna para moneda

        transactionsSheet.columns = columns;

        data.transactions.forEach((transaction) => {
          const rowData: any = {
            date: formatDate(new Date(transaction.date)),
            description: transaction.description,
            category: transaction.scope?.category?.name || "Sin categoría",
            amount: transaction.amount,
          };

          // Solo agregar usuario si el scope es compartido
          if (data.scope.shared) {
            const user = data.users.get(transaction.user_id);
            if (user && user.name.first) {
              rowData.user = user.name.first.substring(0, 3).toUpperCase();
            } else {
              rowData.user = transaction.user_id.substring(0, 3).toUpperCase();
            }
          }

          // Agregar símbolo de moneda
          const currencySymbol =
            data.accountSymbols.get(transaction.account_id) || "";
          rowData.currency = currencySymbol;

          transactionsSheet.addRow(rowData);
        });

        // Generar buffer
        workbook.xlsx
          .writeBuffer()
          .then((buffer) => {
            observer.next(buffer as Buffer);
            observer.complete();
          })
          .catch((error) => {
            observer.error(error);
          });
      } catch (error) {
        observer.error(error);
      }
    });
  }
}
