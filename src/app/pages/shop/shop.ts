import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/services/api/api';
import { CartService } from '../../core/services/cart/cart';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.html',
  styleUrls: ['./shop.scss'],
  standalone: false
})
export class Shop implements OnInit, OnDestroy {
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: string[] = ['Gym Equipments', 'Supplements'];
  selectedCategory: string = 'Gym Equipments';
  loading = true;
  cartItemIds: Set<string> = new Set();
  private cartSub: Subscription | undefined;

  constructor(
    public api: ApiService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.fetchProducts();
    this.cartSub = this.cartService.getCartItems().subscribe(items => {
      this.cartItemIds = new Set(items.map(item => item.id));
      this.syncQuantities(items);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
  }

  fetchProducts() {
    this.api.get<any>('products?limit=100').subscribe({
      next: (res) => {
        this.products = res.data;
        this.filterByCategory(this.selectedCategory);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.loading = false;
      }
    });
  }

  syncQuantities(cartItems: any[]) {
    this.filteredProducts.forEach(p => {
      const cartItem = cartItems.find(item => item.id === p.id);
      if (cartItem) {
        p.selectedQuantity = cartItem.quantity;
      }
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    const cartItems = this.cartService.getCartItemsValue();
    this.filteredProducts = this.products.filter(p => p.category === category).map(p => {
      const cartItem = cartItems.find(item => item.id === p.id);
      return {
        ...p,
        selectedQuantity: cartItem ? cartItem.quantity : 1
      };
    });
    this.cdr.detectChanges();
  }

  isInCart(productId: string): boolean {
    return this.cartItemIds.has(productId);
  }

  handleCartAction(product: any) {
    if (this.isInCart(product.id)) {
      this.router.navigate(['/cart']);
    } else {
      this.cartService.addToCart(product, product.selectedQuantity);
    }
  }

  removeFromCart(product: any) {
    this.cartService.removeFromCart(product.id);
    product.selectedQuantity = 1; // Reset local quantity
  }

  updateQuantity(product: any, change: number) {
    const newQty = (product.selectedQuantity || 1) + change;
    if (newQty >= 0 && newQty <= 20) {
      if (this.isInCart(product.id)) {
        this.cartService.updateItemQuantity(product.id, newQty);
        if (newQty === 0) {
          product.selectedQuantity = 1; // Reset for next add
        } else {
          product.selectedQuantity = newQty;
        }
      } else {
        if (newQty >= 1) {
          product.selectedQuantity = newQty;
        }
      }
    }
  }
}
