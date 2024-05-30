import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShellModule } from './shell/shell.module';
import { SharedModule } from './shared/shared.module';
import { HomeComponent } from './home/home.component';
import { LitoTableConfigService } from 'lito-fr';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ShellModule,
    SharedModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private gcService: LitoTableConfigService) {
    gcService.setGeneralConfigurations({
      elevation: 2,
      columnHeaderStyle: {
        tr: {
          height: '42px',
        },
        th: {
          paddingLeft: '16px',
          paddingRight: '16px',
        },
      },
      dataRowStyle: {
        tr: {
          height: '42px',
        },
        td: {
          paddingLeft: '16px',
          paddingRight: '16px',
        },
      },
      pagination: {
        paginationSizes: [5, 10, 15, 25],
      },
      nonRegistries: {
        fetchedText: 'No hay registros',
        fetchingText: 'Buscando registros',
        style: {
          tr: {
            height: '48px',
          },
          td: {
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
      },
    });
  }
}
