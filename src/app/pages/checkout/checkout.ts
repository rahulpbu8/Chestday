import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart/cart';
import { AddressService, Address } from '../../core/services/address/address';
import { OrderService } from '../../core/services/order/order';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
  standalone: false
})
export class Checkout implements OnInit {
  cartItems: CartItem[] = [];
  subtotal: number = 0;
  shipping: number = 0;
  tax: number = 0;
  total: number = 0;

  addresses: Address[] = [];
  selectedAddressId: string | null = null;
  showAddressForm: boolean = false;
  isLoadingAddresses: boolean = true;
  addressForm: FormGroup;

  step: number = 1; // 1: Address, 2: Review, 3: Payment
  isProcessing: boolean = false;

  constructor(
    public cartService: CartService,
    public addressService: AddressService,
    public orderService: OrderService,
    public authService: AuthService,
    public router: Router,
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef
  ) {
    this.addressForm = this.fb.group({
      fullName: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      isDefault: [false]
    });
  }

  ngOnInit() {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      if (this.cartItems.length === 0 && this.step !== 4) {
        this.router.navigate(['/shop']);
      }
      this.calculateTotals();
    });

    this.loadAddresses();
  }

  loadAddresses() {
    this.isLoadingAddresses = true;
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        this.addresses = data;
        const defaultAddr = this.addresses.find(a => a.isDefault);
        if (defaultAddr) {
          this.selectedAddressId = defaultAddr.id;
          this.showAddressForm = false;
        } else if (this.addresses.length > 0) {
          this.selectedAddressId = this.addresses[0].id;
          this.showAddressForm = false;
        } else {
          this.showAddressForm = true;
        }
        this.isLoadingAddresses = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading addresses', err);
        this.isLoadingAddresses = false;
        this.showAddressForm = true;
        this.cdr.detectChanges();
      }
    });
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.shipping = this.subtotal > 2000 ? 0 : 150;
    this.tax = this.subtotal * 0.18;
    this.total = this.subtotal + this.shipping + this.tax;
  }

  selectAddress(id: string) {
    this.selectedAddressId = id;
    this.showAddressForm = false;
  }

  nextStep() {
    if (this.step === 1) {
      if (!this.selectedAddressId && !this.showAddressForm) return;
      if (this.showAddressForm) {
        this.saveAddress();
        return;
      }
    }
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  saveAddress() {
    if (this.addressForm.valid) {
      this.isProcessing = true;
      this.addressService.createAddress(this.addressForm.value).subscribe({
        next: (newAddr) => {
          this.addresses.push(newAddr);
          this.selectedAddressId = newAddr.id;
          this.showAddressForm = false;
          this.isProcessing = false;
          this.step = 2;
        },
        error: (err) => {
          alert('Error saving address. Please ensure the backend server has been restarted to detect new modules.');
          console.error('Error saving address', err);
          this.isProcessing = false;
        }
      });
    } else {
      this.addressForm.markAllAsTouched();
    }
  }

  placeOrder() {
    if (!this.selectedAddressId) return;

    this.isProcessing = true;

    const orderData = {
      addressId: this.selectedAddressId,
      totalAmount: this.total,
      paymentMethod: 'Credit Card', // Mockup
      items: this.cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.isProcessing = false;
        this.router.navigate(['/payment-success']);
      },
      error: (err) => {
        alert(err.error?.message || 'Error placing order');
        this.isProcessing = false;
      }
    });
  }
}
