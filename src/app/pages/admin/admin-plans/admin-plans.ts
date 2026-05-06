import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../core/services/api/api';
import { Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modal.service';
import { AdminAuth } from '../../../core/services/admin-auth';

@Component({
  selector: 'app-admin-plans',
  standalone: false,
  templateUrl: './admin-plans.html',
  styleUrl: './admin-plans.scss'
})
export class AdminPlans implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(ModalService);
  private auth = inject(AdminAuth);

  plans: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchTerm: string = '';
  isLoading = true;
  isEliteAdmin = false;

  ngOnInit() {
    this.loadPlans();
    this.auth.admin$.subscribe(admin => {
      this.isEliteAdmin = this.auth.isEliteAdmin();
      this.cdr.markForCheck();
    });
  }

  loadPlans() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.api.get<any>(`pricingPlans?page=${this.currentPage}&limit=${this.itemsPerPage}&search=${this.searchTerm}`).subscribe({
      next: (res) => {
        // Handle both paginated and legacy array responses
        this.plans = res.data || (Array.isArray(res) ? res : []);
        this.totalItems = res.total || this.plans.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading plans', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadPlans();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadPlans();
  }

  onEdit(id: string) {
    this.router.navigate(['/admin/plans/edit', id]);
  }

  async onDelete(id: string) {
    const confirmed = await this.modalService.confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this plan? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'error'
    });

    if (confirmed) {
      this.api.delete(`pricingPlans/${id}`).subscribe({
        next: () => {
          this.loadPlans();
          this.modalService.showInfo({
            title: 'Deleted',
            message: 'Plan has been successfully removed.',
            type: 'success'
          });
        },
        error: (err) => {
          console.error('Delete failed:', err);
          const errorMsg = err.error?.message || err.message || 'Unknown error';
          this.modalService.showInfo({
            title: 'Error',
            message: 'Error deleting plan: ' + errorMsg,
            type: 'error'
          });
        }
      });
    }
  }
}
