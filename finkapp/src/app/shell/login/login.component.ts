import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<LoginComponent>);

  form: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(16),
    ]),
  });

  public lastLoginEmail: string | null = null;

  ngOnInit(): void {
    this.updateFormDisableState();
  }

  async login() {
    if (this.form.invalid) return;
    const { username, password } = this.form.value;

    // Login clásico
    this.authService
      .login(username, password)
      .subscribe(() => {
        localStorage.setItem('lastLoginEmail', username);
        this.dialogRef.close('ok');
      })
      .add(() => this.updateFormDisableState());
    this.updateFormDisableState();
  }

  updateFormDisableState() {
    if (this.fetching && this.form.enabled) {
      this.form.disable();
    } else if (!this.fetching && this.form.disabled) {
      this.form.enable();
    }
  }

  changeToRegister() {
    this.dialogRef.close('changeDialog');
  }

  close() {
    this.dialogRef.close(false);
  }

  public get fetching(): boolean {
    return this.authService.fetching;
  }
}
