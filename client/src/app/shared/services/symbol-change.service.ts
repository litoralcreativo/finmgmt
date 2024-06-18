import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { routes } from 'src/environments/routes';
import {
  SymbolChange,
  SymbolChangeResponse,
} from '../models/symbolChange.model';

@Injectable({
  providedIn: 'root',
})
export class SymbolChangeService {
  readonly prices: Map<string, SymbolChange> = new Map();
  $prices = new BehaviorSubject<Map<string, SymbolChange>>(this.prices);

  constructor(private http: HttpClient) {
    this.$prices.next(this.prices);
    this.fetchCurrencyData();
  }

  fetchCurrencyData() {
    this.http
      .get<SymbolChangeResponse>(routes.currency.mep, {
        headers: { 'on-error': 'skip-notify', 'skip-auth': 'skipit' },
      })
      .subscribe((x) => {
        this.prices.set('MEP', {
          compra: parseFloat(x.compra.replace(',', '.')),
          venta: parseFloat(x.venta.replace(',', '.')),
          fecha: new Date(x.fecha.replace(' ', '')),
          variacion: parseFloat(x.variacion.replace(',', '.')),
          'class-variacion': x['class-variacion'],
        });
      });

    this.http
      .get<SymbolChangeResponse>(routes.currency.cripto, {
        headers: { 'on-error': 'skip-notify', 'skip-auth': 'skipit' },
      })
      .subscribe((x) => {
        this.prices.set('CRIPTO', {
          compra: parseFloat(x.compra.replace(',', '.')),
          venta: parseFloat(x.venta.replace(',', '.')),
          fecha: new Date(x.fecha.replace(' ', '')),
          variacion: parseFloat(x.variacion.replace(',', '.')),
          'class-variacion': x['class-variacion'],
        });
      });

    this.http
      .get<SymbolChangeResponse>(routes.currency.informal, {
        headers: { 'on-error': 'skip-notify', 'skip-auth': 'skipit' },
      })
      .subscribe((x) => {
        this.prices.set('INFORMAL', {
          compra: parseFloat(x.compra.replace(',', '.')),
          venta: parseFloat(x.venta.replace(',', '.')),
          fecha: new Date(x.fecha.replace(' ', '')),
          variacion: parseFloat(x.variacion.replace(',', '.')),
          'class-variacion': x['class-variacion'],
        });
      });
  }
}
