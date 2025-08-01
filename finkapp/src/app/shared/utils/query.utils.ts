import { SspPayload } from '../models/sspdata.model';

export interface QueryKV {
  key: string;
  value: string;
}

export function generateQuery(kv: QueryKV[]): string {
  return kv.map((x) => `${x.key}=${x.value}`).join('&');
}

export function generateSspKV<T>(ssp: SspPayload<T>): QueryKV[] {
  const kv: QueryKV[] = [];
  if (ssp.paginator) {
    kv.push({ key: 'page', value: ssp.paginator.pageIndex.toString() });
    kv.push({ key: 'pageSize', value: ssp.paginator.pageSize.toString() });
  }
  if (ssp.sort) {
    kv.push({ key: 'sortDirection', value: ssp.sort.direction });
    kv.push({ key: 'sortActive', value: ssp.sort.active });
  }
  if (ssp.filter) {
    kv.push({ key: 'filterOptions', value: ssp.filter.filterOptions.join(',') });
    if (ssp.filter.filterValue) {
      kv.push({ key: 'filterValue', value: ssp.filter.filterValue });
    }
  }
  return kv;
}

export function generateFilterKV<T>(
  filter: Partial<{
    [P in keyof T]: string;
  }>
): { key: string; value: string }[] {
  const result: { key: string; value: string }[] = [];
  Object.entries<any>(filter).forEach(([key, value]) => {
    if (value) result.push({ key: key, value: value ?? '' });
  });
  return result;
}