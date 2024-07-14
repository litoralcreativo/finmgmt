import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './modules/material.module';
import { KComponent } from './components/k/k.component';
import { LoadingPanelComponent } from './components/loading-panel/loading-panel.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AnimatedLogoComponent } from './components/animated-logo/animated-logo.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './handlers/AuthInterceptor';
import { LogoComponent } from './components/logo/logo.component';
import { BrandComponent } from './components/brand/brand.component';
import { SkeletonLoaderDirective } from './directives/skeleton-loader.directive';
import { NumericInputDirective } from './directives/numeric-input.directive';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TransactionDialogComponent } from './components/transaction-dialog/transaction-dialog.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  NgxMaskDirective,
  NgxMaskPipe,
  provideEnvironmentNgxMask,
} from 'ngx-mask';
import { FormatDatePipe } from './pipes/format-date.pipe';
import { MonthlyCategoriesComponent } from './components/monthly-categories/monthly-categories.component';
import { BalanceGraphComponent } from './components/balance-graph/balance-graph.component';
import { TransactionListItemComponent } from './components/transaction-list-item/transaction-list-item.component';
import { IconSelectorComponent } from './components/icon-selector/icon-selector.component';
import { CategoryDialogComponent } from './components/category-dialog/category-dialog.component';

@NgModule({
  declarations: [
    KComponent,
    LoadingPanelComponent,
    AnimatedLogoComponent,
    LogoComponent,
    BrandComponent,
    SkeletonLoaderDirective,
    NumericInputDirective,
    TransactionDialogComponent,
    ConfirmationComponent,
    FormatDatePipe,
    MonthlyCategoriesComponent,
    BalanceGraphComponent,
    TransactionListItemComponent,
    IconSelectorComponent,
    CategoryDialogComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  exports: [
    MaterialModule,
    KComponent,
    LoadingPanelComponent,
    ReactiveFormsModule,
    AnimatedLogoComponent,
    LogoComponent,
    BrandComponent,
    SkeletonLoaderDirective,
    NumericInputDirective,
    TransactionDialogComponent,
    ConfirmationComponent,
    FormatDatePipe,
    MonthlyCategoriesComponent,
    BalanceGraphComponent,
    TransactionListItemComponent,
    IconSelectorComponent,
    CategoryDialogComponent,
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNativeDateAdapter(),
    provideEnvironmentNgxMask(),
  ],
})
export class SharedModule {}
