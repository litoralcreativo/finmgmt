import { Component, OnInit } from '@angular/core';
import {
  LitoCSP,
  LitoSSP,
  LitoTableCatcher,
  LitotableSSPResponse,
  RowActionEmission,
  SSPLitoTablePayload,
} from 'lito-fr';
import { Observable } from 'rxjs';
import { SSPPAYLOAD } from '../shared/models/sspdata.model';
import { Product } from './models/product.model';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent
  extends LitoTableCatcher<Product>
  implements OnInit, LitoSSP<Product>
{
  inputSource: Observable<LitotableSSPResponse<Product>>;
  type = Product;

  constructor(private prodService: ProductService) {
    super();
  }

  ngOnInit(): void {
    this._tableConfigurations();
    this._consultar();
  }

  private _tableConfigurations() {
    this.lito.tableConfigManager.enableProgressBar();
    this.lito.tableConfigManager.enablePagination([5, 10, 25]);
    this.lito.tableConfigManager.setToolbarItems({ columnSelector: true });
    this.lito.tableConfigManager.setRowActions({
      editar: { icon: 'edit' },
      quitar: { icon: 'delete' },
    });
  }

  private _consultar() {
    const sspPayload: SSPPAYLOAD<Product> = {
      paginator: {
        pageIndex: 0,
        pageSize: 5,
      },
    };

    if (this.lito?.paginator) sspPayload.paginator = this.lito.paginator;
    if (this.lito?.generalFilterState)
      sspPayload.filter = this.lito.generalFilterState;
    if (this.lito?.sort) sspPayload.sort = this.lito.sort;

    const obs = this.prodService.getProductsSSPAndFilter(sspPayload);
    if (!this.inputSource) {
      this.inputSource = obs;
    } else {
    }
  }

  SSPChange($event: SSPLitoTablePayload<Product>): void {
    const obs = this.prodService.getProductsSSPAndFilter($event);
    this.lito.updateTableData(obs);
  }

  onRowActionClicked(rowEmission: RowActionEmission<Product>) {
    switch (rowEmission.action) {
      case 'editar':
        console.log('EDITAR', rowEmission.row);
        break;
      case 'quitar':
        this._borrarElementoYConsultar(rowEmission.row);
        break;
    }
  }

  private _borrarElementoYConsultar(row: Product) {
    this.prodService.deleteProduct(row);
    this._consultar();
  }
}
