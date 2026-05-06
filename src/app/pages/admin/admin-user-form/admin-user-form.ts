import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modal.service';

@Component({
  selector: 'app-admin-user-form',
  standalone: false,
  templateUrl: './admin-user-form.html',
  styleUrl: './admin-user-form.scss'
})
export class AdminUserForm implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalService = inject(ModalService);

  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  isLoading = false;

  constructor() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []], // Optional in edit mode
      role: ['admin', Validators.required]
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      this.loadUser();
      // Password is not required when editing
      this.userForm.get('password')?.setValidators([]);
    } else {
      // Password is required for new users
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  loadUser() {
    if (!this.userId) return;
    this.isLoading = true;
    this.api.get<any>(`users/${this.userId}`).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading user', err);
        this.modalService.showInfo({
          title: 'Error',
          message: 'Failed to load user details.',
          type: 'error'
        });
        this.router.navigate(['/admin/users']);
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.isLoading = true;
    const userData = { ...this.userForm.value };

    // Remove password if empty in edit mode
    if (this.isEditMode && !userData.password) {
      delete userData.password;
    }

    const obs = this.isEditMode
      ? this.api.patch(`users/${this.userId}`, userData)
      : this.api.post('users', userData);

    obs.subscribe({
      next: () => {
        this.modalService.showInfo({
          title: 'Success',
          message: `Admin user ${this.isEditMode ? 'updated' : 'created'} successfully.`,
          type: 'success'
        });
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error('Operation failed', err);
        this.modalService.showInfo({
          title: 'Error',
          message: err.error?.message || 'Something went wrong.',
          type: 'error'
        });
        this.isLoading = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/users']);
  }
}
