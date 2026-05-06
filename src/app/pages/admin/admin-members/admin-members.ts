import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../core/services/api/api';
import { Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modal.service';
import { AdminAuth } from '../../../core/services/admin-auth';

@Component({
  selector: 'app-admin-members',
  standalone: false,
  templateUrl: './admin-members.html',
  styleUrl: './admin-members.scss'
})
export class AdminMembers implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(ModalService);
  private auth = inject(AdminAuth);

  members: any[] = [];
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
    this.loadMembers();
  }

  loadMembers() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.api.get<any>(`users/members?page=${this.currentPage}&limit=${this.itemsPerPage}&search=${this.searchTerm}`).subscribe({
      next: (res) => {
        this.members = res.data || (Array.isArray(res) ? res : []);
        this.totalItems = res.total || this.members.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading members', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadMembers();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadMembers();
  }

  onEdit(id: string) {
    this.router.navigate(['/admin/members/edit', id]);
  }

  async onDelete(id: string) {
    const confirmed = await this.modalService.confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this member? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'error'
    });

    if (confirmed) {
      this.api.delete(`users/${id}`).subscribe({
        next: () => {
          this.loadMembers();
          this.modalService.showInfo({
            title: 'Deleted',
            message: 'Member has been successfully removed.',
            type: 'success'
          });
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.modalService.showInfo({
            title: 'Error',
            message: 'Error deleting member: ' + (err.error?.message || err.message),
            type: 'error'
          });
        }
      });
    }
  }

  onLogout() {
    this.auth.logout();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'expired': return 'status-expired';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }
}
