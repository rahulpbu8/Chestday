import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.scss'],
  standalone: false
})
export class PaymentSuccess implements OnInit {
  transactionId: string = '';
  amount: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.transactionId = this.route.snapshot.queryParams['txn'] || 'CHEST-N/A';
    this.amount = this.route.snapshot.queryParams['amount'] || '0.00';
  }
}
