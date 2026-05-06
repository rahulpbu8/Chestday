import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order/order';
import { AdminAuth } from '../../../core/services/admin-auth';

@Component({
  selector: 'app-admin-order-detail',
  templateUrl: './admin-order-detail.html',
  styleUrls: ['./admin-order-detail.scss'],
  standalone: false
})
export class AdminOrderDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private auth = inject(AdminAuth);
  private cdr = inject(ChangeDetectorRef);

  order: any = null;
  isLoading = true;
  isEliteAdmin = false;

  ngOnInit() {
    this.auth.admin$.subscribe(() => {
      this.isEliteAdmin = this.auth.isEliteAdmin();
      this.cdr.markForCheck();
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrderDetail(id);
    } else {
      this.goBack();
    }
  }

  loadOrderDetail(id: string) {
    this.isLoading = true;
    this.orderService.getOrderDetailAdmin(id).subscribe({
      next: (data) => {
        this.order = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading order detail', err);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/orders']);
  }

  getStatusClass(status: string) {
    return `status-${status.toLowerCase()}`;
  }

  getSubtotal() {
    if (!this.order?.items) return 0;
    return this.order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  }

  getTax() {
    return this.getSubtotal() * 0.18; // 18% tax
  }

  getShipping() {
    return 10; // Fixed shipping for now
  }
}
