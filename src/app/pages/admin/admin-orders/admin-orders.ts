import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Order, OrderService } from '../../../core/services/order/order';
import { Router } from '@angular/router';
import { AdminAuth } from '../../../core/services/admin-auth';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.html',
  styleUrls: ['./admin-orders.scss'],
  standalone: false
})
export class AdminOrders implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);
  private auth = inject(AdminAuth);
  private cdr = inject(ChangeDetectorRef);

  orders: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchTerm: string = '';
  isLoading = true;
  isEliteAdmin = false;

  ngOnInit() {
    this.auth.admin$.subscribe(() => {
      this.isEliteAdmin = this.auth.isEliteAdmin();
      this.cdr.markForCheck();
    });
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.orderService.getAllOrdersAdmin(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res) => {
        console.log('Orders API Response:', res);
        // Handle both paginated and legacy array responses
        this.orders = res.data || (Array.isArray(res) ? res : []);
        this.totalItems = res.total || this.orders.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading admin orders', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadOrders();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadOrders();
  }

  viewDetail(id: string) {
    this.router.navigate(['/admin/orders', id]);
  }

  getStatusClass(status: string) {
    return `status-${status.toLowerCase()}`;
  }
}
