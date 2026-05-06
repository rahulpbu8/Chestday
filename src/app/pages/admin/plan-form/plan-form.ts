import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ApiService } from '../../../core/services/api/api';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modal.service';

@Component({
  selector: 'app-plan-form',
  standalone: false,
  templateUrl: './plan-form.html',
  styleUrl: './plan-form.scss'
})
export class PlanForm implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalService = inject(ModalService);

  planForm: FormGroup;
  isEditMode = false;
  planId: string | null = null;
  isLoading = false;

  constructor() {
    this.planForm = this.fb.group({
      name: ['', [Validators.required]],
      price: ['', [Validators.required]],
      period: ['', [Validators.required]],
      isPopular: [false],
      features: this.fb.array([])
    });
  }

  get features() {
    return this.planForm.get('features') as FormArray;
  }

  ngOnInit() {
    this.planId = this.route.snapshot.paramMap.get('id');
    if (this.planId) {
      this.isEditMode = true;
      this.loadPlan();
    } else {
      // Add one empty feature by default for new plan
      this.addFeature();
    }
  }

  addFeature(value: string = '') {
    this.features.push(this.fb.control(value, [Validators.required]));
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }

  loadPlan() {
    this.isLoading = true;
    this.api.get<any>(`pricingPlans/${this.planId}`).subscribe({
      next: (plan) => {
        // Clear default features and add from plan
        while (this.features.length) {
          this.features.removeAt(0);
        }

        if (plan.features && plan.features.length > 0) {
          plan.features.forEach((f: string) => this.addFeature(f));
        }

        this.planForm.patchValue({
          name: plan.name,
          price: plan.price,
          period: plan.period,
          isPopular: plan.isPopular
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading plan', err);
        this.modalService.showInfo({
          title: 'Error',
          message: 'Failed to load plan details.',
          type: 'error'
        });
        this.router.navigate(['/admin/plans']);
      }
    });
  }

  onSubmit() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const planData = this.planForm.value;

    const request = this.isEditMode
      ? this.api.patch(`pricingPlans/${this.planId}`, planData)
      : this.api.post('pricingPlans', planData);

    request.subscribe({
      next: () => {
        this.modalService.showInfo({
          title: 'Success',
          message: `Plan ${this.isEditMode ? 'updated' : 'created'} successfully!`,
          type: 'success'
        });
        this.router.navigate(['/admin/plans']);
      },
      error: (err) => {
        console.error('Error saving plan', err);
        this.isLoading = false;
        const errorMsg = err.error?.message || err.message || 'Unknown error';
        this.modalService.showInfo({
          title: 'Error',
          message: `Failed to ${this.isEditMode ? 'update' : 'create'} plan: ` + errorMsg,
          type: 'error'
        });
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/plans']);
  }
}
