import { Db } from "mongodb";
import { Observable, from, throwError } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { FinancialScopeService } from "./financialScope.service";
import { TransactionService } from "./transaction.service";
import PDFDocument from "pdfkit";
import * as ExcelJS from "exceljs";

export class ReportService {
  private financialScopeService: FinancialScopeService;
  private transactionService: TransactionService;

  constructor(private db: Db) {
    this.financialScopeService = new FinancialScopeService(db);
    this.transactionService = new TransactionService(db);
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
  ): Observable<any> {
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
              return this.transactionService
                .getCategoryAmountsByScope(scopeId, { from, to })
                .pipe(
                  map((categoryAmounts) => ({
                    scope,
                    transactions: transactions.elements,
                    categoryAmounts,
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
                  }))
                );
            })
          );
      })
    );
  }

  private generatePDFReport(data: any): Observable<Buffer> {
    return new Observable((observer) => {
      try {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          observer.next(pdfBuffer);
          observer.complete();
        });

        // Header del reporte
        doc
          .fontSize(20)
          .text(`Reporte Mensual - ${data.scope.name}`, { align: "center" });
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

        doc
          .fontSize(16)
          .text(
            `Período: ${monthNames[data.period.month]} ${data.period.year}`,
            { align: "center" }
          );
        doc.moveDown(2);

        // Resumen financiero
        doc.fontSize(14).text("Resumen Financiero:", { underline: true });
        doc.moveDown(0.5);
        doc
          .fontSize(12)
          .text(`Total de Ingresos: $${data.totalIncome.toLocaleString()}`)
          .text(`Total de Gastos: $${data.totalExpenses.toLocaleString()}`)
          .text(
            `Balance: $${(
              data.totalIncome - data.totalExpenses
            ).toLocaleString()}`
          )
          .text(`Total de Transacciones: ${data.totalTransactions}`);

        doc.moveDown(2);

        // Gastos por categoría
        if (data.categoryAmounts.length > 0) {
          doc.fontSize(14).text("Gastos por Categoría:", { underline: true });
          doc.moveDown(0.5);

          data.categoryAmounts.forEach((cat: any) => {
            if (cat.total < 0) {
              doc
                .fontSize(12)
                .text(`${cat._id}: $${Math.abs(cat.total).toLocaleString()}`);
            }
          });

          doc.moveDown(2);
        }

        // Lista de transacciones recientes (últimas 20)
        doc.fontSize(14).text("Transacciones Recientes:", { underline: true });
        doc.moveDown(0.5);

        const recentTransactions = data.transactions.slice(0, 20);
        recentTransactions.forEach((transaction: any, index: number) => {
          const date = new Date(transaction.date).toLocaleDateString();
          const amount =
            transaction.amount > 0
              ? `+$${transaction.amount}`
              : `-$${Math.abs(transaction.amount)}`;
          const text = `${date} | ${transaction.description} | ${amount}`;

          doc.fontSize(10).text(text);

          if (index < recentTransactions.length - 1) {
            doc.moveDown(0.3);
          }
        });

        doc.end();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  private generateExcelReport(data: any): Observable<Buffer> {
    return new Observable((observer) => {
      try {
        const workbook = new ExcelJS.Workbook();

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

        summarySheet.mergeCells("A2:D2");
        summarySheet.getCell("A2").value = `Período: ${
          monthNames[data.period.month]
        } ${data.period.year}`;
        summarySheet.getCell("A2").alignment = { horizontal: "center" };

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
        transactionsSheet.columns = [
          { header: "Fecha", key: "date", width: 12 },
          { header: "Descripción", key: "description", width: 30 },
          { header: "Categoría", key: "category", width: 15 },
          { header: "Monto", key: "amount", width: 15 },
        ];

        data.transactions.forEach((transaction: any) => {
          transactionsSheet.addRow({
            date: new Date(transaction.date).toLocaleDateString(),
            description: transaction.description,
            category: transaction.scope?.category?.name || "Sin categoría",
            amount: transaction.amount,
          });
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
