import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShellComponent } from './shell.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ShellComponent],
  imports: [CommonModule, SharedModule, RouterModule],
  exports: [ShellComponent],
})
export class ShellModule {}
