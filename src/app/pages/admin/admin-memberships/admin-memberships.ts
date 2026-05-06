import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth/auth';
import { ApiService } from '../../../core/services/api/api';

@Component({
  selector: 'app-admin-memberships',
  templateUrl: './admin-memberships.html',
  styleUrls: ['./admin-memberships.scss'],
  standalone: false
})
export class AdminMemberships implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  memberships: any[] = [];
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  isEliteAdmin = false;

  ngOnInit() {
    this.isEliteAdmin = this.auth.currentUserValue?.role === 'super_admin';
    this.loadMemberships();
  }

  loadMemberships() {
    this.isLoading = true;
    this.cdr.markForCheck();
    
    // Construct query string manually since ApiService.get doesn't take params yet
    const query = `page=${this.currentPage}&limit=${this.itemsPerPage}&search=${this.searchTerm}`;
    
    this.apiService.get<any>(`memberships?${query}`)
      .subscribe({
        next: (res) => {
          this.memberships = res.data;
          this.totalItems = res.total;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading memberships:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadMemberships();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadMemberships();
  }
}
