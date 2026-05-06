import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api/api';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modal.service';

@Component({
  selector: 'app-branch-form',
  standalone: false,
  templateUrl: './branch-form.html',
  styleUrl: './branch-form.scss'
})
export class BranchForm implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalService = inject(ModalService);

  branchForm: FormGroup;
  isEditMode = false;
  branchId: string | null = null;
  isLoading = false;

  constructor() {
    this.branchForm = this.fb.group({
      city: ['', [Validators.required]],
      location: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      locationLink: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.branchId = this.route.snapshot.paramMap.get('id');
    if (this.branchId) {
      this.isEditMode = true;
      this.loadBranch();
    }
  }

  loadBranch() {
    this.isLoading = true;
    this.api.get<any>(`branches/${this.branchId}`).subscribe({
      next: (branch) => {
        this.branchForm.patchValue(branch);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading branch', err);
        this.modalService.showInfo({
          title: 'Error',
          message: 'Failed to load branch details.',
          type: 'error'
        });
        this.router.navigate(['/admin/branches']);
      }
    });
  }

  onSubmit() {
    if (this.branchForm.invalid) return;

    this.isLoading = true;
    const branchData = this.branchForm.value;

    const request = this.isEditMode
      ? this.api.patch(`branches/${this.branchId}`, branchData)
      : this.api.post('branches', branchData);

    request.subscribe({
      next: () => {
        this.modalService.showInfo({
          title: 'Success',
          message: `Branch ${this.isEditMode ? 'updated' : 'created'} successfully!`,
          type: 'success'
        });
        this.router.navigate(['/admin/branches']);
      },
      error: (err) => {
        console.error('Error saving branch', err);
        this.isLoading = false;
        const errorMsg = err.error?.message || err.message || 'Unknown error';
        this.modalService.showInfo({
          title: 'Error',
          message: `Failed to ${this.isEditMode ? 'update' : 'create'} branch: ` + errorMsg,
          type: 'error'
        });
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/branches']);
  }
}
