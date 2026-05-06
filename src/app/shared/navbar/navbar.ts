import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth';
import { CartService } from '../../core/services/cart/cart';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdminAuth } from '../../core/services/admin-auth';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  standalone: false
})
export class Navbar implements OnInit {
  isMenuOpen = false;
  currentUser: any;
  cartCount = 0;
  isAdminView = false;
  currentAdmin: any;
  showNavbar = true;

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    public router: Router,
    public adminAuth: AdminAuth
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    this.cartService.getCartCount().subscribe(count => {
      this.cartCount = count;
    });

    this.adminAuth.admin$.subscribe(admin => {
        this.currentAdmin = admin;
    });

    // Check current route on initialization
    this.checkAdminView(this.router.url);

    // Watch for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkAdminView(event.urlAfterRedirects);
    });
  }

  private checkAdminView(url: string) {
    this.isAdminView = url.includes('/admin');
    this.showNavbar = !url.includes('/admin/login');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    if (this.isAdminView) {
        this.adminAuth.logout();
    } else {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
  }
}
