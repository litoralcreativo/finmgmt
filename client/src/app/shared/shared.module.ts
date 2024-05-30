import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { LitoFrModule } from 'lito-fr';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [CommonModule, MaterialModule, LitoFrModule, HttpClientModule],
  exports: [MaterialModule, LitoFrModule],
})
export class SharedModule {}
