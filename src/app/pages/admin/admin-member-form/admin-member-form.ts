import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modal.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-member-form',
  standalone: false,
  templateUrl: './admin-member-form.html',
  styleUrl: './admin-member-form.scss'
})
export class AdminMemberForm implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalService = inject(ModalService);

  memberForm: FormGroup;
  userId: string | null = null;
  isLoading = false;
  branches: any[] = [];
  plans: any[] = [];

  constructor() {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      emergencyContactName: [''],
      emergencyContactPhone: [''],
      membershipStatus: ['pending'],
      membershipExpiry: [''],
      branchId: [null],
      planId: [null]
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading = true;

    // Fetch branches and plans first
    const branchesObs = this.api.get<any>('branches');
    const plansObs = this.api.get<any>('plans');

    const requests: any = {
      branches: branchesObs,
      plans: plansObs
    };

    if (this.userId) {
      requests.member = this.api.get<any>(`users/${this.userId}`);
    }

    forkJoin(requests).subscribe({
      next: (res: any) => {
        this.branches = res.branches.data || res.branches;
        this.plans = res.plans.data || res.plans;

        if (res.member) {
          this.memberForm.patchValue({
            name: res.member.name,
            email: res.member.email,
            phone: res.member.phone,
            emergencyContactName: res.member.emergencyContactName,
            emergencyContactPhone: res.member.emergencyContactPhone,
            membershipStatus: res.member.membershipStatus,
            membershipExpiry: res.member.membershipExpiry ? new Date(res.member.membershipExpiry).toISOString().substring(0, 10) : '',
            branchId: res.member.branchId,
            planId: res.member.planId
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data', err);
        this.modalService.showInfo({
          title: 'Error',
          message: 'Failed to load member details or lookup data.',
          type: 'error'
        });
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.memberForm.invalid || !this.userId) return;

    this.isLoading = true;
    const userData = { ...this.memberForm.value };

    if (!userData.membershipExpiry) {
      userData.membershipExpiry = null;
    }

    this.api.patch(`users/${this.userId}`, userData).subscribe({
      next: () => {
        this.modalService.showInfo({
          title: 'Success',
          message: 'Member profile updated successfully.',
          type: 'success'
        });
        this.router.navigate(['/admin/members']);
      },
      error: (err) => {
        console.error('Update failed', err);
        this.modalService.showInfo({
          title: 'Error',
          message: err.error?.message || 'Failed to update member profile.',
          type: 'error'
        });
        this.isLoading = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/members']);
  }
}
