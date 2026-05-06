import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth/auth-guard';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Branches } from './pages/branches/branches';
import { Contact } from './pages/contact/contact';
import { Pricing } from './pages/pricing/pricing';
import { Payment } from './pages/payment/payment';
import { PaymentSuccess } from './pages/payment-success/payment-success';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Shop } from './pages/shop/shop';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { Profile } from './pages/profile/profile';

const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'about', component: About },
  { path: 'branches', component: Branches },
  { path: 'contact', component: Contact },
  { path: 'admin', loadChildren: () => import('./pages/admin/admin-module').then(m => m.AdminModule) },
  { path: 'pricing', component: Pricing },
  { path: 'shop', component: Shop },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout, canActivate: [AuthGuard] },
  { path: 'payment', component: Payment, canActivate: [AuthGuard] },
  { path: 'payment-success', component: PaymentSuccess, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
