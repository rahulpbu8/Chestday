import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../core/services/api/api';
import { Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modal.service';
import { AdminAuth } from '../../../core/services/admin-auth';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss'
})
export class AdminUsers implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(ModalService);
  private auth = inject(AdminAuth);

  users: any[] = [];
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
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.api.get<any>(`users?page=${this.currentPage}&limit=${this.itemsPerPage}&search=${this.searchTerm}`).subscribe({
      next: (res) => {
        this.users = res.data || (Array.isArray(res) ? res : []);
        this.totalItems = res.total || this.users.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  onEdit(id: string) {
    this.router.navigate(['/admin/users/edit', id]);
  }

  async onDelete(id: string) {
    const confirmed = await this.modalService.confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this admin user? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'error'
    });

    if (confirmed) {
      this.api.delete(`users/${id}`).subscribe({
        next: () => {
          this.loadUsers();
          this.modalService.showInfo({
            title: 'Deleted',
            message: 'Admin user has been successfully removed.',
            type: 'success'
          });
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.modalService.showInfo({
            title: 'Error',
            message: 'Error deleting user: ' + (err.error?.message || err.message),
            type: 'error'
          });
        }
      });
    }
  }

  getRoleLabel(role: string): string {
    return role === 'super_admin' ? 'ELITE ADMIN' : 'ADMIN';
  }
}
