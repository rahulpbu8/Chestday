import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/services/api/api';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.html',
  styleUrls: ['./pricing.scss'],
  standalone: false
})
export class Pricing implements OnInit {
  pricingPlans: any[] = [];
  loading = true;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // Fetch all plans for the public page (using a large limit)
    this.api.get<any>('pricingPlans?limit=100').subscribe({
      next: (res) => {
        this.pricingPlans = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching pricing plans', err);
        this.loading = false;
      }
    });
  }
}
