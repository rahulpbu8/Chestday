import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api/api';
import { AuthService } from '../../core/services/auth/auth';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss'],
  standalone: false
})
export class Payment implements OnInit {
  selectedMethod: string = '';
  isProcessing: boolean = false;
  planId: string | null = null;
  planDetails: any = null;
  loading = true;

  paymentMethods = [
    { id: 'upi', name: 'UPI', icon: 'smartphone', options: ['GPay', 'PhonePe', 'Paytm', 'BHIM'] },
    { id: 'card', name: 'Credit/Debit Card', icon: 'credit_card', options: ['Visa', 'Mastercard', 'Rupay'] },
    { id: 'netbanking', name: 'Net Banking', icon: 'account_balance', options: ['HDFC', 'SBI', 'ICICI', 'Federal Bank'] },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.planId = this.route.snapshot.queryParams['plan'];
    if (this.planId) {
      this.api.get<any>(`pricingPlans/${this.planId}`).subscribe({
        next: (data) => {
          this.planDetails = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching plan', err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  selectMethod(methodId: string) {
    this.selectedMethod = methodId;
  }

  processPayment() {
    if (!this.selectedMethod || !this.planDetails) return;

    this.isProcessing = true;

    const paymentData = {
      userId: this.authService.currentUserValue?.id,
      userName: this.authService.currentUserValue?.name,
      planId: this.planDetails.id,
      planName: this.planDetails.name,
      amount: this.planDetails.price,
      method: this.selectedMethod,
      date: new Date().toISOString()
    };

    this.api.post('payments', paymentData).subscribe({
      next: (res: any) => {
        this.isProcessing = false;
        if (res.success) {
          this.router.navigate(['/payment-success'], {
            queryParams: {
              txn: res.transactionId,
              amount: this.planDetails.price
            }
          });
        } else {
          console.error('Payment failed:', res.message);
          alert('Payment Failed: ' + (res.message || 'Please try again later.'));
        }
      },
      error: (err) => {
        this.isProcessing = false;
        console.error('Payment connection error:', err);
        const errorMsg = err.error?.message || err.message || 'Could not connect to the server';
        alert(`Payment Error: ${errorMsg}. Please check your connection and try again.`);
      }
    });
  }
}
