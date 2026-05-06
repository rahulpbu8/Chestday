import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth';
import { ApiService } from '../../core/services/api/api';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  standalone: false
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  branches: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private api: ApiService
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', Validators.required],
      emergencyContactName: ['', Validators.required],
      emergencyContactPhone: ['', Validators.required],
      branchId: [null, Validators.required]
    });

    this.loadBranches();
  }

  loadBranches() {
    this.api.get<any>('branches').subscribe({
      next: (res) => {
        this.branches = res.data || res;
      },
      error: (err) => {
        console.error('Error loading branches', err);
      }
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.register(this.registerForm.value)
      .subscribe({
        next: () => {
          this.authService.login(this.f['email'].value, this.f['password'].value).subscribe(() => {
            this.router.navigate(['/']);
          });
        },
        error: error => {
          this.error = error.error?.message || error.message;
          this.loading = false;
        }
      });
  }
}
