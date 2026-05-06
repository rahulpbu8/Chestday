import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
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
import { ModalComponent } from './shared/components/modal/modal.component';
import { ChatbotComponent } from './shared/components/chatbot/chatbot';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    App,
    Navbar,
    Footer,
    Home,
    About,
    Branches,
    Contact,
    Pricing,
    Payment,
    PaymentSuccess,
    Login,
    Register,
    Shop,
    Cart,
    Checkout,
    Profile,
    ModalComponent,
    ChatbotComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    provideHttpClient(),
    provideAnimations()
  ],
  bootstrap: [App]
})
export class AppModule { }
