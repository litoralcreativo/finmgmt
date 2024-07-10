import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShellComponent } from './shell.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    ShellComponent,
    LoginComponent,
    RegisterComponent,
    UserMenuComponent,
    HeaderComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule],
  exports: [ShellComponent],
})
export class ShellModule {}
