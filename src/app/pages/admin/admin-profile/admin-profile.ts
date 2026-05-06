import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api/api';
import { AdminAuth } from '../../../core/services/admin-auth';
import { ModalService } from '../../../core/services/modal/modal.service';

@Component({
  selector: 'app-admin-profile',
  standalone: false,
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.scss'
})
export class AdminProfile implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AdminAuth);
  private modalService = inject(ModalService);

  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  isPasswordLoading = false;
  admin: any = null;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      email: [{ value: '', disabled: true }]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.admin = this.auth.admin;
    if (this.admin) {
      this.profileForm.patchValue({
        name: this.admin.name,
        phone: this.admin.phone || '',
        email: this.admin.email
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    this.api.patch('users/profile', this.profileForm.getRawValue()).subscribe({
      next: (updatedAdmin: any) => {
        this.isLoading = false;
        // Update local auth state
        const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
        const newUser = { ...currentUser, ...updatedAdmin };
        localStorage.setItem('admin_user', JSON.stringify(newUser));
        // We'll need to trigger a refresh in AdminAuth if it's using a Subject
        (this.auth as any).adminSubject?.next(newUser);

        this.modalService.showInfo({
          title: 'Success',
          message: 'Profile updated successfully.',
          type: 'success'
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.modalService.showInfo({
          title: 'Error',
          message: err.error?.message || 'Failed to update profile.',
          type: 'error'
        });
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;

    this.isPasswordLoading = true;
    this.api.post('users/change-password', this.passwordForm.value).subscribe({
      next: () => {
        this.isPasswordLoading = false;
        this.passwordForm.reset();
        this.modalService.showInfo({
          title: 'Success',
          message: 'Password changed successfully.',
          type: 'success'
        });
      },
      error: (err) => {
        this.isPasswordLoading = false;
        this.modalService.showInfo({
          title: 'Error',
          message: err.error?.message || 'Failed to change password. Please check your old password.',
          type: 'error'
        });
      }
    });
  }
}
