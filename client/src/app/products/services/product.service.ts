import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LitotableSSPResponse } from 'lito-fr';
import { PaginatorData } from 'lito-fr/lib/lito-table/configurations/litoTableSSP';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SSPPAYLOAD, SSPRESPONSE } from 'src/app/shared/models/sspdata.model';
import { environment } from 'src/environments/environment';
import { Product, ProductResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getProductsSSPAndFilter(
    ssp: SSPPAYLOAD<Product>
  ): Observable<LitotableSSPResponse<Product>> {
    const page = ssp.paginator.pageIndex;
    const pageSize = ssp.paginator.pageSize;
    const pagination: string = `page=${page}&pageSize=${pageSize}`;

    return this.http
      .get<SSPRESPONSE<ProductResponse>>(
        `${environment.productController}?${pagination}`
      )
      .pipe(
        map((x) => {
          return {
            source: x.elements.map((x) => new Product(x)),
            page: x.page,
            pageSize: x.pageSize,
            total: x.total,
          };
        })
      );
  }

  deleteProduct(row: Product) {
    return;
  }
}
