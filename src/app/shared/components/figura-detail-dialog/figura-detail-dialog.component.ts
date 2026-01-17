import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Figura } from '../../../core/models/figura.model';

@Component({
  selector: 'app-figura-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatChipsModule,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <div class="dialog-container">
      <button mat-icon-button class="close-btn" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>

      <div class="gallery-section">
        <img [src]="currentImage" [alt]="data.nombre" loading="lazy" class="main-image" />
        
        @if (allImages.length > 1) {
          <div class="thumbnails">
            @for (img of allImages; track img; let i = $index) {
              <img 
                [src]="img" 
                [alt]="'Imagen ' + (i + 1)"
                [class.active]="img === currentImage"
                (click)="currentImage = img"
                loading="lazy"
                class="thumbnail"
              />
            }
          </div>
        }
      </div>

      <div class="info-section">
        <h2 mat-dialog-title>{{ data.nombre }}</h2>
        
        <div class="precio-destacado">
          {{ data.precio | currency:'CLP':'symbol-narrow':'1.0-0' }}
        </div>

        <mat-dialog-content>
          <div class="info-block">
            <h4>Descripción</h4>
            <p>{{ data.descripcionLarga }}</p>
          </div>

          <div class="info-block">
            <h4>Historia</h4>
            <p>{{ data.historia }}</p>
          </div>

          <div class="meta-info">
            <mat-chip-set>
              <mat-chip>
                <mat-icon matChipAvatar>calendar_today</mat-icon>
                {{ data.fechaCompra | date:'mediumDate' }}
              </mat-chip>
              <mat-chip>
                <mat-icon matChipAvatar>place</mat-icon>
                {{ data.lugarCompra }}
              </mat-chip>
              @if (data.categoria) {
                <mat-chip>
                  <mat-icon matChipAvatar>category</mat-icon>
                  {{ data.categoria }}
                </mat-chip>
              }
            </mat-chip-set>
          </div>
        </mat-dialog-content>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      gap: 24px;
      padding: 24px;
      max-width: 900px;
      position: relative;
    }

    .close-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 10;
    }

    .gallery-section {
      flex: 1;
      max-width: 400px;
    }

    .main-image {
      width: 100%;
      border-radius: 8px;
      object-fit: cover;
      max-height: 400px;
    }

    .thumbnails {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      overflow-x: auto;
      padding: 4px 0;
    }

    .thumbnail {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .thumbnail:hover,
    .thumbnail.active {
      opacity: 1;
    }

    .info-section {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    h2 {
      margin: 0 0 8px 0;
      font-size: 1.5rem;
    }

    .precio-destacado {
      font-size: 2rem;
      font-weight: 700;
      color: #e91e63;
      margin-bottom: 16px;
    }

    .info-block {
      margin-bottom: 16px;
    }

    .info-block h4 {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .info-block p {
      margin: 0;
      line-height: 1.6;
    }

    .meta-info {
      margin-top: auto;
      padding-top: 16px;
    }

    @media (max-width: 768px) {
      .dialog-container {
        flex-direction: column;
        padding: 16px;
      }

      .gallery-section {
        max-width: 100%;
      }
    }
  `]
})
export class FiguraDetailDialogComponent {
  data = inject<Figura>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<FiguraDetailDialogComponent>);

  allImages: string[] = [this.data.imagenPrincipal, ...this.data.imagenesAdicionales];
  currentImage = this.data.imagenPrincipal;

  close(): void {
    this.dialogRef.close();
  }
}
