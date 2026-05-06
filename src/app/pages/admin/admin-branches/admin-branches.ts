import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../core/services/api/api';
import { Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modal.service';
import { AdminAuth } from '../../../core/services/admin-auth';

@Component({
  selector: 'app-admin-branches',
  standalone: false,
  templateUrl: './admin-branches.html',
  styleUrl: './admin-branches.scss'
})
export class AdminBranches implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(ModalService);
  private auth = inject(AdminAuth);

  branches: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchTerm: string = '';
  isLoading = true;
  isEliteAdmin = false;

  ngOnInit() {
    this.auth.admin$.subscribe(admin => {
      this.isEliteAdmin = this.auth.isEliteAdmin();
      this.cdr.markForCheck();
    });
    this.loadBranches();
  }

  loadBranches() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.api.get<any>(`branches?page=${this.currentPage}&limit=${this.itemsPerPage}&search=${this.searchTerm}`).subscribe({
      next: (res) => {
        // Handle both paginated and legacy array responses
        this.branches = res.data || (Array.isArray(res) ? res : []);
        this.totalItems = res.total || this.branches.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading branches', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadBranches();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadBranches();
  }

  onEdit(id: string) {
    this.router.navigate(['/admin/branches/edit', id]);
  }

  async onDelete(id: string) {
    const confirmed = await this.modalService.confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this branch? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'error'
    });

    if (confirmed) {
      this.api.delete(`branches/${id}`).subscribe({
        next: () => {
          this.loadBranches();
          this.modalService.showInfo({
            title: 'Deleted',
            message: 'Branch has been successfully removed.',
            type: 'success'
          });
        },
        error: (err) => {
          console.error('Delete failed:', err);
          const errorMsg = err.error?.message || err.message || 'Unknown error';
          this.modalService.showInfo({
            title: 'Error',
            message: 'Error deleting branch: ' + errorMsg,
            type: 'error'
          });
        }
      });
    }
  }
}
