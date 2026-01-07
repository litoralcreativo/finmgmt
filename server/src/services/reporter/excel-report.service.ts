import { Observable } from "rxjs";
import * as ExcelJS from "exceljs";
import { MonthlyReportData } from "./report.service";
import { IReport } from "./IReport.interface";

export class ExcelReportService implements IReport {
  /**
   * Genera un reporte mensual en formato Excel con la hoja de transacciones.
   * @param data Datos del reporte mensual
   * @returns Observable con el buffer del archivo Excel generado
   */
  generateReport(data: MonthlyReportData): Observable<Buffer> {
    return new Observable((observer) => {
      try {
        const workbook = new ExcelJS.Workbook();
        const transactionsSheet = this.createTransactionsSheet(workbook, data);
        this.addTransactionsRows(transactionsSheet, data);
        this.formatHeader(transactionsSheet);
        this.addAutoFilter(transactionsSheet, data);
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

  /**
   * Crea la hoja de transacciones y define las columnas según el tipo de scope.
   * @param workbook Instancia de ExcelJS.Workbook
   * @param data Datos del reporte mensual
   * @returns Hoja de transacciones creada
   */
  private createTransactionsSheet(
    workbook: ExcelJS.Workbook,
    data: MonthlyReportData
  ): ExcelJS.Worksheet {
    const columns = [
      { header: "Fecha", key: "date", width: 12 },
      { header: "Descripción", key: "description", width: 30 },
      { header: "Categoría", key: "category", width: 15 },
    ];
    if (data.scope.shared) {
      columns.push({ header: "Usuario", key: "user", width: 10 });
    }
    columns.push({ header: "Monto", key: "amount", width: 15 });
    columns.push({ header: "Moneda", key: "currency", width: 10 });
    const sheet = workbook.addWorksheet("Transacciones");
    sheet.columns = columns;
    return sheet;
  }

  /**
   * Agrega las filas de transacciones a la hoja.
   * @param sheet Hoja de transacciones
   * @param data Datos del reporte mensual
   */
  private addTransactionsRows(
    sheet: ExcelJS.Worksheet,
    data: MonthlyReportData
  ) {
    data.transactions.forEach((transaction) => {
      const rowData: any = {
        date: this.formatDate(new Date(transaction.date)),
        description: transaction.description,
        category: transaction.scope?.category?.name || "Sin categoría",
        amount: transaction.amount, // dejar como número
      };
      if (data.scope.shared) {
        const user = data.users.get(transaction.user_id);
        if (user && user.name.first) {
          rowData.user = user.name.first.substring(0, 3).toUpperCase();
        } else {
          rowData.user = transaction.user_id.substring(0, 3).toUpperCase();
        }
      }
      const currencySymbol =
        data.accountSymbols.get(transaction.account_id) || "";
      rowData.currency = currencySymbol;
      sheet.addRow(rowData);
    });
    // Formato de número para la columna 'Monto'
    const amountCol = sheet.getColumn("amount");
    amountCol.numFmt = "#,##0.00";
  }

  /**
   * Aplica formato en negrita a la fila de encabezado.
   * @param sheet Hoja de transacciones
   */
  private formatHeader(sheet: ExcelJS.Worksheet) {
    sheet.getRow(1).font = { bold: true };
  }

  /**
   * Agrega autofiltro a la fila de encabezado.
   * @param sheet Hoja de transacciones
   * @param data Datos del reporte mensual
   */
  private addAutoFilter(sheet: ExcelJS.Worksheet, data: MonthlyReportData) {
    const columnsCount = data.scope.shared ? 6 : 5;
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columnsCount },
    };
  }

  /**
   * Formatea una fecha en formato dd/MM/yyyy.
   * @param date Fecha a formatear
   * @returns Fecha formateada como string
   */
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
