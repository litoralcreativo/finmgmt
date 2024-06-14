import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(16),
    ]),
  });

  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateFormDisableState();
  }

  login() {
    if (this.form.invalid) return;
    const { username, password } = this.form.value;
    this.authService
      .login(username, password)
      .subscribe((x) => {
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
