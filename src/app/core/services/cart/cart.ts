import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private cartCount = new BehaviorSubject<number>(0);

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getCartItemsValue(): CartItem[] {
    return this.cartItems.value;
  }

  getCartCount(): Observable<number> {
    return this.cartCount.asObservable();
  }

  isInCart(productId: string): boolean {
    return this.cartItems.value.some(item => item.id === productId);
  }

  addToCart(product: any, quantity: number = 1) {
    const currentItems = [...this.cartItems.value];
    const existingItem = currentItems.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image
      };
      currentItems.push(newItem);
    }
    this.cartItems.next(currentItems);
    this.updateCartCount();
  }

  updateItemQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItems.value.map(item => {
      if (item.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    this.cartItems.next(currentItems);
    this.updateCartCount();
  }

  removeFromCart(productId: string) {
    const updatedItems = this.cartItems.value.filter(item => item.id !== productId);
    this.cartItems.next(updatedItems);
    this.updateCartCount();
  }

  clearCart() {
    this.cartItems.next([]);
    this.updateCartCount();
  }

  private updateCartCount() {
    const count = this.cartItems.value.reduce((acc, item) => acc + item.quantity, 0);
    this.cartCount.next(count);
  }
}
