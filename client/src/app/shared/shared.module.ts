import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { LitoFrModule } from 'lito-fr';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
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
  ],
})
export class SharedModule {}
