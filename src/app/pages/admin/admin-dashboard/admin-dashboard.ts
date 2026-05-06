import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { AdminAuth } from '../../../core/services/admin-auth';
import { AdminProducts } from '../../../core/services/admin-products';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api/api';
import { ModalService } from '../../../core/services/modal/modal.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private auth = inject(AdminAuth);
  private productsService = inject(AdminProducts);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private apiService = inject(ApiService);
  private modalService = inject(ModalService);

  products: any[] = [];
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
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.productsService.getProducts(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res) => {
        console.log('Products API Response:', res);
        // Handle both paginated and legacy array responses
        this.products = res.data || (Array.isArray(res) ? res : []);
        this.totalItems = res.total || this.products.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.currentPage = 1; // Reset to first page on new search
    this.loadProducts();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }

  onEdit(id: string) {
    this.router.navigate(['/admin/products/edit', id]);
  }

  async onDelete(id: string) {
    const confirmed = await this.modalService.confirm({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'error'
    });

    if (confirmed) {
      this.productsService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts(); // Refresh immediately
          this.modalService.showInfo({
            title: 'Deleted',
            message: 'Product has been successfully removed.',
            type: 'success'
          });
        },
        error: (err) => {
          console.error('Delete failed:', err);
          const errorMsg = err.error?.message || err.message || 'Unknown error';
          this.modalService.showInfo({
            title: 'Error',
            message: 'Error deleting product: ' + (Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg),
            type: 'error'
          });
        }
      });
    }
  }

  getImageUrl(image: string) {
    return this.apiService.getImageUrl(image);
  }
}
