import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  form: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(16),
    ]),
  });

  constructor(
    public dialogRef: MatDialogRef<RegisterComponent>,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateFormDisableState();
  }

  register() {
    if (this.form.invalid) return;
    const { email, firstName, lastName, password } = this.form.value;
    this.authService
      .register({ email, password, firstName, lastName })
      .subscribe((x) => {
        this.dialogRef.close(true);
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

  changeToLogin() {
    this.dialogRef.close('changeDialog');
  }

  close() {
    this.dialogRef.close(false);
  }

  public get fetching(): boolean {
    return this.authService.fetching;
  }
}
