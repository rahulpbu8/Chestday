import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  isAdminView = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkAdminView(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkAdminView(event.urlAfterRedirects);
    });
  }

  private checkAdminView(url: string) {
    this.isAdminView = url.includes('/admin');
  }
}
