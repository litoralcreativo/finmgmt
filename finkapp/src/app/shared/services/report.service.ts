import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  downloadMonthlyReport(
    scopeId: string,
    year: number,
    month: number,
    format: 'pdf' | 'excel' = 'pdf'
  ): Observable<Blob> {
    const url = `${this.apiUrl}/scopes/${scopeId}/report/monthly`;
    const params = {
      year: year.toString(),
      month: month.toString(),
      format: format,
    };

    const headers = new HttpHeaders({
      Accept:
        format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    return this.http.get(url, {
      params,
      headers,
      responseType: 'blob',
    });
  }
}
