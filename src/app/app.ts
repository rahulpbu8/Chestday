import { Component, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('chest-day-gym');
  protected showLayout = signal(true);
  protected showChatbot = signal(true);
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.showLayout.set(!['/login', '/register'].includes(url));
      
      // Hide chatbot on admin pages, login, and register
      const isAdmin = url.startsWith('/admin');
      const isAuth = ['/login', '/register'].includes(url);
      this.showChatbot.set(!isAdmin && !isAuth);
    });
  }
}
