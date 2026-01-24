import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterLink } from '@angular/router';
import { FiguraCardComponent } from '../../shared/components/figura-card/figura-card.component';
import { FiguraDetailDialogComponent } from '../../shared/components/figura-detail-dialog/figura-detail-dialog.component';
import { FiguraService } from '../../core/services/figura.service';
import { ThemeService } from '../../core/services/theme.service';
import { SeoService } from '../../core/services/seo.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Figura } from '../../core/models/figura.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

interface FilterOption {
  label: string;
  value: string;
  active: boolean;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatExpansionModule,
    RouterLink,
    FiguraCardComponent
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent implements OnInit {
  private figuraService = inject(FiguraService);
  private themeService = inject(ThemeService);
  private seoService = inject(SeoService);
  private analytics = inject(AnalyticsService);
  private dialog = inject(MatDialog);
  private platformId = inject(PLATFORM_ID);

  figuras = signal<Figura[]>([]);
  filteredFiguras = signal<Figura[]>([]);
  loading = signal(true);
  searchTerm = '';
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  hasMore = signal(false);
  isDark = this.themeService.isDark;
  currentYear = new Date().getFullYear();
  filtersExpanded = signal(false);

  // Filtros
  categorias: FilterOption[] = [
    { label: 'Anime', value: 'Anime', active: false },
    { label: 'Serie', value: 'Serie', active: false },
    { label: 'Película', value: 'Película', active: false },
    { label: 'Videojuegos', value: 'Videojuegos', active: false },
    { label: 'Superhéroes', value: 'Superhéroes', active: false },
    { label: 'Animados', value: 'Animados', active: false },
    { label: 'Antigüedades', value: 'Antigüedades', active: false }
  ];

  rangosPrecios: FilterOption[] = [
    { label: 'Menos de $10.000', value: '0-10000', active: false },
    { label: '$10.000 - $20.000', value: '10000-20000', active: false },
    { label: '$20.000 - $50.000', value: '20000-50000', active: false },
    { label: 'Más de $50.000', value: '50000-999999', active: false }
  ];

  ferias: FilterOption[] = [
    { label: 'Villa Alemana', value: 'Villa Alemana', active: false },
    { label: 'Quilpué', value: 'Quilpué', active: false },
    { label: 'Viña del Mar', value: 'Viña', active: false },
    { label: 'Valparaíso', value: 'Valparaíso', active: false },
    { label: 'Marketplace', value: 'Marketplace', active: false }
  ];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.seoService.setDefaultTags();
      this.loadFiguras();
      
      this.searchSubject.pipe(
        debounceTime(400),
        distinctUntilChanged()
      ).subscribe(term => {
        this.applyFilters();
      });
    } else {
      this.loading.set(false);
    }
  }

  loadFiguras(): void {
    this.loading.set(true);
    // Cargar todas las figuras para filtrado local
    this.figuraService.getAll(1, 1000, '', true).subscribe({
      next: (response) => {
        this.figuras.set(response.data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
    if (term) {
      this.analytics.trackSearch(term);
    }
  }

  toggleFilter(filter: FilterOption, group: FilterOption[]): void {
    filter.active = !filter.active;
    this.applyFilters();
    
    // Track filter usage
    const filterType = group === this.categorias ? 'categoria' : 
                       group === this.rangosPrecios ? 'precio' : 'feria';
    this.analytics.trackFilter(filterType, filter.label);
  }

  clearFilters(): void {
    this.categorias.forEach(c => c.active = false);
    this.rangosPrecios.forEach(r => r.active = false);
    this.ferias.forEach(f => f.active = false);
    this.searchTerm = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.categorias.some(c => c.active) ||
           this.rangosPrecios.some(r => r.active) ||
           this.ferias.some(f => f.active) ||
           this.searchTerm.length > 0;
  }

  applyFilters(): void {
    let filtered = [...this.figuras()];

    // Filtro de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.nombre.toLowerCase().includes(term) ||
        f.lugarCompra.toLowerCase().includes(term)
      );
    }

    // Filtro de categorías
    const activeCategorias = this.categorias.filter(c => c.active).map(c => c.value);
    if (activeCategorias.length > 0) {
      filtered = filtered.filter(f => f.categoria && activeCategorias.includes(f.categoria));
    }

    // Filtro de precios
    const activeRangos = this.rangosPrecios.filter(r => r.active);
    if (activeRangos.length > 0) {
      filtered = filtered.filter(f => {
        return activeRangos.some(rango => {
          const [min, max] = rango.value.split('-').map(Number);
          return f.precio >= min && f.precio <= max;
        });
      });
    }

    // Filtro de ferias
    const activeFerias = this.ferias.filter(f => f.active).map(f => f.value);
    if (activeFerias.length > 0) {
      filtered = filtered.filter(f => 
        activeFerias.some(feria => f.lugarCompra.includes(feria))
      );
    }

    this.filteredFiguras.set(filtered);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  openDetail(figura: Figura): void {
    this.seoService.setFiguraTags(figura);
    this.analytics.trackFiguraView(figura._id || '', figura.nombre);
    
    this.dialog.open(FiguraDetailDialogComponent, {
      data: figura,
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'figura-detail-dialog'
    }).afterClosed().subscribe(() => {
      // Restaurar tags por defecto al cerrar
      this.seoService.setDefaultTags();
    });
  }
}
