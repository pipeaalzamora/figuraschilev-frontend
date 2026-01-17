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
import { RouterLink } from '@angular/router';
import { FiguraCardComponent } from '../../shared/components/figura-card/figura-card.component';
import { FiguraDetailDialogComponent } from '../../shared/components/figura-detail-dialog/figura-detail-dialog.component';
import { FiguraService } from '../../core/services/figura.service';
import { Figura } from '../../core/models/figura.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

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
        <!-- Search -->
        <div class="search-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar figura</mat-label>
            <input 
              matInput 
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Escribe el nombre..."
            />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>

        @if (loading() && figuras().length === 0) {
          <div class="loading-container">
            <mat-spinner diameter="50"></mat-spinner>
            <p>Cargando colección...</p>
          </div>
        } @else if (figuras().length === 0) {
          <div class="empty-state">
            <mat-icon>collections</mat-icon>
            @if (searchTerm) {
              <h3>Sin resultados</h3>
              <p>No encontré figuras con "{{ searchTerm }}"</p>
            } @else {
              <h3>Aún no hay figuras</h3>
              <p>Pronto agregaré mis tesoros de las ferias</p>
            }
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

          @if (hasMore()) {
            <div class="load-more">
              <button mat-raised-button color="primary" (click)="loadMore()" [disabled]="loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Cargar más
                }
              </button>
            </div>
          }
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

    .search-container {
      max-width: 500px;
      margin: 0 auto 30px;
    }

    .search-field {
      width: 100%;
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

    .load-more {
      display: flex;
      justify-content: center;
      margin-top: 40px;
    }

    .load-more mat-spinner {
      display: inline-block;
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
  searchTerm = '';
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  hasMore = signal(false);

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFiguras();
      
      this.searchSubject.pipe(
        debounceTime(400),
        distinctUntilChanged()
      ).subscribe(term => {
        this.currentPage = 1;
        this.figuras.set([]);
        this.loadFiguras(term);
      });
    } else {
      this.loading.set(false);
    }
  }

  loadFiguras(search = ''): void {
    this.loading.set(true);
    this.figuraService.getAll(this.currentPage, this.pageSize, search, true).subscribe({
      next: (response) => {
        if (this.currentPage === 1) {
          this.figuras.set(response.data);
        } else {
          this.figuras.update(current => [...current, ...response.data]);
        }
        this.totalItems = response.total;
        this.hasMore.set(this.figuras().length < response.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  loadMore(): void {
    this.currentPage++;
    this.loadFiguras(this.searchTerm);
  }

  openDetail(figura: Figura): void {
    this.dialog.open(FiguraDetailDialogComponent, {
      data: figura,
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'figura-detail-dialog'
    });
  }
}
