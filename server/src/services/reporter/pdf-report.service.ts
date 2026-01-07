import { Observable } from "rxjs";
import PDFDocument from "pdfkit";
import { MonthlyReportData } from "./report.service";
import { IReport } from "./IReport.interface";

export class PdfReportService implements IReport {
  /**
   * Genera un reporte mensual en formato PDF.
   * @param data Datos del reporte mensual
   * @returns Observable con el buffer del archivo PDF generado
   */
  generateReport(data: MonthlyReportData): Observable<Buffer> {
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
        this.addHeader(doc, data);
        this.addPeriod(doc, data);
        this.addFinancialSummary(doc, data); // <-- Resumen financiero
        this.addCategoryExpenses(doc, data); // <-- Gastos por categoría
        this.addTransactionsTable(doc, data);
        doc.end();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Agrega el encabezado principal al PDF.
   * @param doc Documento PDFKit
   * @param data Datos del reporte mensual
   */
  private addHeader(doc: PDFKit.PDFDocument, data: MonthlyReportData) {
    doc.fontSize(20);
    const titleText = "Reporte Mensual - ";
    const titleWidth = doc.widthOfString(titleText);
    const scopeNameWidth = doc.widthOfString(data.scope.name);
    const totalWidth = titleWidth + scopeNameWidth;
    const pageWidth = doc.page.width;
    const startX = (pageWidth - totalWidth) / 2;
    doc.text(titleText, startX, doc.y, { continued: false });
    doc
      .font("Helvetica-Bold")
      .text(data.scope.name, startX + titleWidth, doc.y - 23, {
        continued: false,
      })
      .font("Helvetica");

    doc.moveDown();
  }

  /**
   * Agrega el período (mes y año) al PDF.
   * @param doc Documento PDFKit
   * @param data Datos del reporte mensual
   */
  private addPeriod(doc: PDFKit.PDFDocument, data: MonthlyReportData) {
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
    const periodText = "Período: ";
    const periodLabelWidth = doc.widthOfString(periodText);
    const periodValueText = `${monthNames[data.period.month]} ${
      data.period.year
    }`;
    const periodValueWidth = doc.widthOfString(periodValueText);
    const totalPeriodWidth = periodLabelWidth + periodValueWidth;
    const pageWidth = doc.page.width;
    const periodStartX = (pageWidth - totalPeriodWidth) / 2;
    doc.text(periodText, periodStartX, doc.y, { continued: false });
    doc
      .font("Helvetica-Bold")
      .text(periodValueText, periodStartX + periodLabelWidth, doc.y - 18, {
        continued: false,
      })
      .font("Helvetica");
    doc.moveDown(2);
  }

  /**
   * Agrega el resumen financiero (acumuladores) al PDF.
   */
  private addFinancialSummary(
    doc: PDFKit.PDFDocument,
    data: MonthlyReportData
  ) {
    const colors = {
      black: "#000000",
      income: "#2d7d32",
      expense: "#c62828",
    };
    doc.fontSize(14);
    doc.text("Resumen Financiero:", 50, doc.y, { underline: true });
    doc.moveDown(0.5);
    const summaryLeftMargin = 80;
    const resumenRowHeight = 18;
    const resumenSymbols = Array.from(
      new Set([
        ...data.transactions.map(
          (t) => data.accountSymbols.get(t.account_id) || ""
        ),
      ])
    ).filter(Boolean);
    const resumenColWidths = [180, ...resumenSymbols.map(() => 90)];
    const resumenStartX = summaryLeftMargin;
    let resumenTableY = doc.y;
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("", resumenStartX, resumenTableY, { width: resumenColWidths[0] });
    resumenSymbols.forEach((symbol, i) => {
      doc.text(
        symbol,
        resumenStartX +
          resumenColWidths.slice(0, i + 1).reduce((a, b) => a + b, 0),
        resumenTableY,
        { width: resumenColWidths[i + 1], align: "right" }
      );
    });
    resumenTableY += resumenRowHeight;
    doc.font("Helvetica");
    const incomeBySymbol = new Map<string, number>();
    const expenseBySymbol = new Map<string, number>();
    const balanceBySymbol = new Map<string, number>();
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
      transCountBySymbol.set(symbol, (transCountBySymbol.get(symbol) || 0) + 1);
    });
    resumenSymbols.forEach((symbol) => {
      balanceBySymbol.set(
        symbol,
        (incomeBySymbol.get(symbol) || 0) + (expenseBySymbol.get(symbol) || 0)
      );
    });
    const resumenRows = [
      { label: "Total de Ingresos", map: incomeBySymbol, color: colors.income },
      { label: "Total de Gastos", map: expenseBySymbol, color: colors.expense },
      { label: "Balance", map: balanceBySymbol, color: null },
      {
        label: "Total de Transacciones",
        map: transCountBySymbol,
        color: null,
        isCount: true,
      },
    ];
    resumenRows.forEach((row) => {
      doc.fontSize(11).font("Helvetica").fillColor(colors.black);
      doc.text(row.label, resumenStartX, resumenTableY, {
        width: resumenColWidths[0],
      });
      resumenSymbols.forEach((symbol, i) => {
        let value = row.map.get(symbol) || 0;
        let text = row.isCount ? value.toString() : this.formatCurrency(value);
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
  }

  /**
   * Agrega el desglose de gastos por categoría al PDF.
   */
  private addCategoryExpenses(
    doc: PDFKit.PDFDocument,
    data: MonthlyReportData
  ) {
    const colors = {
      expense: "#c62828",
      black: "#000000",
    };
    if (!data.categoryAmounts || data.categoryAmounts.length === 0) return;
    doc.fontSize(14);
    doc.text("Gastos por Categoría:", 50, doc.y, { underline: true });
    doc.moveDown(0.5);
    const summaryLeftMargin = 80;
    const catRowHeight = 18;
    const resumenSymbols = Array.from(
      new Set([
        ...data.transactions.map(
          (t) => data.accountSymbols.get(t.account_id) || ""
        ),
      ])
    ).filter(Boolean);
    const catColWidths = [180, ...resumenSymbols.map(() => 90)];
    const catStartX = summaryLeftMargin;
    let catTableY = doc.y;
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("", catStartX, catTableY, { width: catColWidths[0] });
    resumenSymbols.forEach((symbol, i) => {
      doc.text(
        symbol,
        catStartX + catColWidths.slice(0, i + 1).reduce((a, b) => a + b, 0),
        catTableY,
        { width: catColWidths[i + 1], align: "right" }
      );
    });
    catTableY += catRowHeight;
    doc.font("Helvetica");
    data.categoryAmounts
      .sort((a, b) => a.total - b.total)
      .forEach((cat) => {
        if (cat.total < 0) {
          doc.fontSize(11).fillColor(colors.black);
          doc.text(cat._id.name, catStartX, catTableY, {
            width: catColWidths[0],
          });
          const transaccionesCat = data.transactions.filter(
            (t) => t.amount < 0 && t.scope?.category?.name === cat._id.name
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
                value ? this.formatCurrency(value) : "-",
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

  /**
   * Agrega la tabla de transacciones al PDF.
   * @param doc Documento PDFKit
   * @param data Datos del reporte mensual
   */
  private addTransactionsTable(
    doc: PDFKit.PDFDocument,
    data: MonthlyReportData
  ) {
    doc.fontSize(14);
    doc.text("Transacciones:", 50, doc.y, { underline: true });
    doc.moveDown(0.5);
    const leftMargin = 50;
    const dateWidth = 80;
    const categoryWidth = 120;
    const descriptionWidth = data.scope.shared ? 140 : 180;
    const userWidth = data.scope.shared ? 60 : 0;
    const amountWidth = 80;
    const currencyWidth = 50;
    const currentY = doc.y;
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Fecha", leftMargin, currentY)
      .text("Categoría", leftMargin + dateWidth, currentY)
      .text("Descripción", leftMargin + dateWidth + categoryWidth, currentY);
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
    data.transactions.forEach((transaction) => {
      const date = this.formatDate(new Date(transaction.date));
      const category = transaction.scope?.category?.name || "Sin categoría";
      const description =
        transaction.description.length > (data.scope.shared ? 20 : 25)
          ? transaction.description.substring(0, data.scope.shared ? 20 : 25) +
            "..."
          : transaction.description;
      const amount =
        transaction.amount > 0
          ? `+ ${this.formatCurrency(transaction.amount)}`
          : `- ${this.formatCurrency(Math.abs(transaction.amount))}`;
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
      const textColor = transaction.amount > 0 ? "#2d7d32" : "#c62828";
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#000000")
        .text(date, leftMargin, currentY)
        .text(category, leftMargin + dateWidth, currentY)
        .text(description, leftMargin + dateWidth + categoryWidth, currentY);
      if (data.scope.shared) {
        doc.text(
          userDisplay,
          leftMargin + dateWidth + categoryWidth + descriptionWidth,
          currentY
        );
      }
      doc
        .fillColor(textColor)
        .text(
          amount,
          leftMargin + dateWidth + categoryWidth + descriptionWidth + userWidth,
          currentY,
          { align: "right", width: amountWidth }
        )
        .fillColor("#000000");
      const currencySymbol =
        data.accountSymbols.get(transaction.account_id) || "";
      const currencyOffset = 10;
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
        .fillColor("#000000");
      doc.moveDown(0.4);
      if (doc.y > 700) {
        doc.addPage();
      }
    });
  }

  /**
   * Formatea una cantidad como moneda con dos decimales.
   * @param amount Cantidad a formatear
   * @returns String con el valor formateado
   */
  private formatCurrency(amount: number): string {
    return amount.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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

/**


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


 */
