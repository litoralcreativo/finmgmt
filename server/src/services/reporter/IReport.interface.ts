import { Observable } from "rxjs";
import { MonthlyReportData } from "./report.service";

export interface IReport {
  generateReport(data: MonthlyReportData): Observable<Buffer>;
}
