import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth';
import { AddressService, Address } from '../../core/services/address/address';
import { OrderService } from '../../core/services/order/order';
import { ApiService } from '../../core/services/api/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  standalone: false
})
export class Profile implements OnInit {
  user: any;
  orders: any[] = [];
  addresses: Address[] = [];
  activeTab: string = 'dashboard';
  isLoading: boolean = true;
  qrCodeValue: string = '';
  daysRemaining: number = 0;

  availableUpgrades: any[] = [];

  constructor(
    public authService: AuthService,
    public addressService: AddressService,
    public orderService: OrderService,
    public api: ApiService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('Profile component: ngOnInit started');
    this.initData();

    // Safety timeout: Ensure the loading state is cleared if requests hang
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('Profile loading safety timeout reached. Forcing isLoading = false.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 4500); // Slightly faster than 5s
  }

  async initData() {
    this.isLoading = true;
    console.log('Profile component: Fetching initial data...');

    try {
      this.loadProfile();
      this.loadOrders();
      this.loadAddresses();
    } catch (err) {
      console.error('Critical error during profile initialization:', err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadProfile() {
    console.log('Profile component: loadProfile called');
    this.api.get<any>('users/profile').subscribe({
      next: (data) => {
        console.log('Profile component: loadProfile success', data);
        this.user = data;
        
        // Identify available upgrades
        if (this.user.payments) {
          const currentTier = this.user.currentPlan?.tier || 0;
          this.availableUpgrades = this.user.payments.filter((p: any) => 
            p.status === 'paid' && p.plan?.tier > currentTier
          );
          console.log('Profile component: found available upgrades', this.availableUpgrades.length);
        }

        this.isLoading = false;
        this.generateQRCode();
        this.calculateDaysRemaining();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Profile component: loadProfile error', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  activatePlan(paymentId: string) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.api.post('payments/activate', { paymentId }).subscribe({
      next: (res: any) => {
        console.log('Profile component: plan activation success', res);
        this.loadProfile(); // Refresh profile after activation
      },
      error: (err) => {
        console.error('Profile component: plan activation error', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadOrders() {
    console.log('Profile component: loadOrders called');
    this.orderService.getOrders().subscribe({
      next: (data) => {
        console.log('Profile component: loadOrders success', data?.length);
        this.orders = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Profile component: loadOrders error', err)
    });
  }

  loadAddresses() {
    console.log('Profile component: loadAddresses called');
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        console.log('Profile component: loadAddresses success', data?.length);
        this.addresses = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Profile component: loadAddresses error', err)
    });
  }

  generateQRCode() {
    if (this.user?.id) {
      this.qrCodeValue = `CHESTDAY-MEMBER-${this.user.id.substring(0, 8).toUpperCase()}`;
    }
  }

  calculateDaysRemaining() {
    if (this.user?.membershipExpiry) {
      try {
        const expiry = new Date(this.user.membershipExpiry);
        const now = new Date();
        const diffTime = expiry.getTime() - now.getTime();
        this.daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        console.log('Profile component: calculated days remaining', this.daysRemaining);
      } catch (err) {
        console.warn('Error calculating days remaining:', err);
        this.daysRemaining = 0;
      }
    }
  }

  setTab(tab: string) {
    console.log('Profile component: setting tab to', tab);
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
