import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private initialized = false;
  private GA_MEASUREMENT_ID = environment.googleAnalyticsId;

  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.initialized || !this.GA_MEASUREMENT_ID) {
      return;
    }

    // Cargar Google Analytics
    this.loadGoogleAnalytics();

    // Track page views
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.trackPageView(event.urlAfterRedirects);
    });

    this.initialized = true;
  }

  private loadGoogleAnalytics(): void {
    // Crear script tag para gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Inicializar gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', this.GA_MEASUREMENT_ID, {
      send_page_view: false // Manejamos page views manualmente
    });
  }

  trackPageView(url: string): void {
    if (!isPlatformBrowser(this.platformId) || !window.gtag) {
      return;
    }

    window.gtag('event', 'page_view', {
      page_path: url
    });
  }

  trackEvent(category: string, action: string, label?: string, value?: number): void {
    if (!isPlatformBrowser(this.platformId) || !window.gtag) {
      return;
    }

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }

  trackFiguraView(figuraId: string, figuraNombre: string): void {
    this.trackEvent('Figura', 'view', figuraNombre);
  }

  trackShare(platform: string, figuraId: string): void {
    this.trackEvent('Share', platform, figuraId);
  }

  trackFilter(filterType: string, filterValue: string): void {
    this.trackEvent('Filter', filterType, filterValue);
  }

  trackSearch(searchTerm: string): void {
    this.trackEvent('Search', 'search_query', searchTerm);
  }
}
