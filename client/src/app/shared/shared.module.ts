import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { LitoFrModule } from 'lito-fr';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { SkeletonLoaderDirective } from './directives/skeleton-loader.directive';
import { TransactionComponent } from './components/transaction/transaction.component';

@NgModule({
  declarations: [SkeletonLoaderDirective, TransactionComponent],
  imports: [
    CommonModule,
    MaterialModule,
    LitoFrModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  exports: [
    MaterialModule,
    LitoFrModule,
    ReactiveFormsModule,
    HttpClientModule,

    SkeletonLoaderDirective,
  ],
})
export class SharedModule {}
