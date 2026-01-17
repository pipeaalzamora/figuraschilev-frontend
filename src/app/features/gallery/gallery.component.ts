import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { FiguraCardComponent } from '../../shared/components/figura-card/figura-card.component';
import { FiguraDetailDialogComponent } from '../../shared/components/figura-detail-dialog/figura-detail-dialog.component';
import { FiguraService } from '../../core/services/figura.service';
import { Figura } from '../../core/models/figura.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    RouterLink,
    FiguraCardComponent
  ],
  template: `
    <div class="gallery-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <h1 class="logo">FigurasChileV</h1>
          <p class="tagline">Mi colección de figuras y tesoros de ferias</p>
          <div class="social-links">
            <a href="https://instagram.com/figuraschilev" target="_blank" mat-icon-button>
              <mat-icon>photo_camera</mat-icon>
            </a>
            <a href="https://tiktok.com/@figuraschilev" target="_blank" mat-icon-button>
              <mat-icon>videocam</mat-icon>
            </a>
          </div>
        </div>
      </header>

      <!-- Gallery Grid -->
      <main class="gallery-main">
        @if (loading()) {
          <div class="loading-container">
            <mat-spinner diameter="50"></mat-spinner>
            <p>Cargando colección...</p>
          </div>
        } @else if (figuras().length === 0) {
          <div class="empty-state">
            <mat-icon>collections</mat-icon>
            <h3>Aún no hay figuras</h3>
            <p>Pronto agregaré mis tesoros de las ferias</p>
          </div>
        } @else {
          <div class="cards-grid">
            @for (figura of figuras(); track figura._id) {
              <app-figura-card 
                [figura]="figura" 
                (cardClick)="openDetail($event)"
              />
            }
          </div>
        }
      </main>

      <!-- Footer -->
      <footer class="footer">
        <p>© 2024 FigurasChileV - Colección personal</p>
        <a routerLink="/admin/login" class="admin-link">Admin</a>
      </footer>
    </div>
  `,
  styles: [`
    .gallery-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .header {
      padding: 40px 20px;
      text-align: center;
      color: white;
    }

    .header-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .logo {
      font-size: 3rem;
      font-weight: 800;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      letter-spacing: 2px;
    }

    .tagline {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 8px 0 20px;
    }

    .social-links a {
      color: white;
      margin: 0 8px;
    }

    .gallery-main {
      flex: 1;
      padding: 40px 20px;
      background: #f5f5f5;
      border-radius: 30px 30px 0 0;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading-container,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 16px 0 8px;
    }

    .footer {
      background: #333;
      color: white;
      padding: 20px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }

    .footer p {
      margin: 0;
    }

    .admin-link {
      color: #aaa;
      text-decoration: none;
      font-size: 0.85rem;
    }

    .admin-link:hover {
      color: white;
    }

    @media (max-width: 600px) {
      .logo {
        font-size: 2rem;
      }

      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GalleryComponent implements OnInit {
  private figuraService = inject(FiguraService);
  private dialog = inject(MatDialog);
  private platformId = inject(PLATFORM_ID);

  figuras = signal<Figura[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    // Only make HTTP calls on the browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.loadFiguras();
    } else {
      this.loading.set(false);
    }
  }

  loadFiguras(): void {
    this.loading.set(true);
    this.figuraService.getAll().subscribe({
      next: (data) => {
        this.figuras.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        // Por ahora cargamos datos de ejemplo
        this.figuras.set(this.getMockData());
      }
    });
  }

  openDetail(figura: Figura): void {
    this.dialog.open(FiguraDetailDialogComponent, {
      data: figura,
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'figura-detail-dialog'
    });
  }

  // Datos de ejemplo mientras no hay backend
  private getMockData(): Figura[] {
    return [
      {
        _id: '1',
        nombre: 'Goku Super Saiyan',
        descripcionCorta: 'Figura de Goku en su transformación más icónica',
        descripcionLarga: 'Figura de colección de Goku en su forma Super Saiyan. Excelente estado, con base incluida. Aproximadamente 18cm de altura.',
        precio: 15000,
        imagenPrincipal: 'https://via.placeholder.com/400x400/667eea/ffffff?text=Goku+SSJ',
        imagenesAdicionales: [
          'https://via.placeholder.com/400x400/764ba2/ffffff?text=Goku+2',
          'https://via.placeholder.com/400x400/f093fb/ffffff?text=Goku+3'
        ],
        historia: 'Encontré esta figura en la feria de las pulgas del Persa Bio Bio. El vendedor la tenía escondida entre otras cosas, pero la vi de inmediato.',
        fechaCompra: new Date('2024-03-15'),
        lugarCompra: 'Persa Bio Bio',
        categoria: 'Anime',
        destacado: true
      },
      {
        _id: '2',
        nombre: 'Spider-Man Classic',
        descripcionCorta: 'El amigable vecino en pose clásica',
        descripcionLarga: 'Figura vintage de Spider-Man de los años 90. Articulaciones móviles y pintura original en buen estado.',
        precio: 8000,
        imagenPrincipal: 'https://via.placeholder.com/400x400/e91e63/ffffff?text=Spiderman',
        imagenesAdicionales: [],
        historia: 'Esta la conseguí en un remate de juguetes antiguos. Me recordó a mi infancia.',
        fechaCompra: new Date('2024-02-20'),
        lugarCompra: 'Feria Santa Lucía',
        categoria: 'Comics'
      },
      {
        _id: '3',
        nombre: 'Pikachu Vintage',
        descripcionCorta: 'Pikachu de primera generación',
        descripcionLarga: 'Peluche original de Pikachu de la primera ola de Pokémon en Chile. Etiqueta original incluida.',
        precio: 12000,
        imagenPrincipal: 'https://via.placeholder.com/400x400/ffc107/000000?text=Pikachu',
        imagenesAdicionales: [
          'https://via.placeholder.com/400x400/ffeb3b/000000?text=Pikachu+2'
        ],
        historia: 'Un clásico de los 90s. Lo encontré en perfectas condiciones en una venta de garage.',
        fechaCompra: new Date('2024-01-10'),
        lugarCompra: 'Venta de garage Ñuñoa',
        categoria: 'Pokémon'
      }
    ];
  }
}
