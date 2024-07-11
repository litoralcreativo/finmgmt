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

@NgModule({
  declarations: [
    KComponent,
    LoadingPanelComponent,
    AnimatedLogoComponent,
    LogoComponent,
    BrandComponent,
    SkeletonLoaderDirective,
    NumericInputDirective,
  ],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
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
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNativeDateAdapter(),
  ],
})
export class SharedModule {}
