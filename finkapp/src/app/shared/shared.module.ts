import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './modules/material.module';
import { KComponent } from './components/k/k.component';
import { LoadingPanelComponent } from './components/loading-panel/loading-panel.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AnimatedLogoComponent } from './components/animated-logo/animated-logo.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './handlers/AuthInterceptor';

@NgModule({
  declarations: [KComponent, LoadingPanelComponent, AnimatedLogoComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  exports: [
    MaterialModule,
    KComponent,
    LoadingPanelComponent,
    ReactiveFormsModule,
    AnimatedLogoComponent,
  ],
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
})
export class SharedModule {}
