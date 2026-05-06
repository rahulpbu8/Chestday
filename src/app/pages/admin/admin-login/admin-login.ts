import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuth } from '../../../core/services/admin-auth';

@Component({
  selector: 'app-admin-login',
  standalone: false,
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  private fb = inject(FormBuilder);
  private auth = inject(AdminAuth);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isLoading = false;
  error = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      
      const { email, password } = this.loginForm.value;
      this.auth.login({ email: email!, password: password! }).subscribe({
        next: () => {
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          console.error('Admin login error:', err);
          this.error = 'Invalid credentials';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
