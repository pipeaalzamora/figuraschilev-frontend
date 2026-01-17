import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  
  theme = signal<Theme>('light');
  isDark = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Cargar tema guardado o detectar preferencia del sistema
      const saved = localStorage.getItem('theme') as Theme;
      if (saved) {
        this.setTheme(saved);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.setTheme('dark');
      }

      // Escuchar cambios en preferencia del sistema
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        document.documentElement.setAttribute('data-theme', this.theme());
        this.isDark.set(this.theme() === 'dark');
      }
    });
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
    }
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }
}
