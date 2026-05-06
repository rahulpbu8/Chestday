import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/services/api/api';

@Component({
  selector: 'app-branches',
  templateUrl: './branches.html',
  styleUrls: ['./branches.scss'],
  standalone: false
})
export class Branches implements OnInit {
  branches: any[] = [];
  loading = true;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.api.get<any>('branches?limit=100').subscribe({
      next: (res) => {
        this.branches = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching branches', err);
        this.loading = false;
      }
    });
  }
}
