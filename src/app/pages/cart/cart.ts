import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService, CartItem } from '../../core/services/cart/cart';
import { ApiService } from '../../core/services/api/api';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
  standalone: false
})
export class Cart implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  subtotal: number = 0;
  shipping: number = 0;
  tax: number = 0;
  total: number = 0;
  private cartSub: Subscription | undefined;

  constructor(
    private cartService: CartService,
    private router: Router,
    public api: ApiService
  ) { }

  ngOnInit() {
    this.cartSub = this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });
  }

  ngOnDestroy() {
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    
    // Simple logic for shipping and tax (or just placeholders)
    this.shipping = this.subtotal > 2000 ? 0 : (this.cartItems.length > 0 ? 150 : 0);
    this.tax = this.subtotal * 0.18; // 18% GST
    this.total = this.subtotal + this.shipping + this.tax;
  }

  updateQuantity(item: CartItem, change: number) {
    const newQty = item.quantity + change;
    if (newQty >= 0) {
      this.cartService.updateItemQuantity(item.id, newQty);
    }
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }

  goBack() {
    this.router.navigate(['/shop']);
  }
}
