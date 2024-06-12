import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { LitoFrModule } from 'lito-fr';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { SkeletonLoaderDirective } from './directives/skeleton-loader.directive';
import { TransactionDialogComponent } from './components/transaction-dialog/transaction-dialog.component';
import { NumericInputDirective } from './directives/numeric-input.directive';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { FavComponent } from './components/fav/fav.component';
import { FormatDatePipe } from './pipes/format-date.pipe';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  declarations: [
    SkeletonLoaderDirective,
    TransactionDialogComponent,
    NumericInputDirective,
    FavComponent,
    FormatDatePipe,
    PieChartComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    LitoFrModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxMaskModule.forRoot(),
    NgApexchartsModule,
  ],
  exports: [
    MaterialModule,
    LitoFrModule,
    ReactiveFormsModule,
    HttpClientModule,
    SkeletonLoaderDirective,
    FormatDatePipe,
    PieChartComponent,
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-AR' }],
})
export class SharedModule {}
