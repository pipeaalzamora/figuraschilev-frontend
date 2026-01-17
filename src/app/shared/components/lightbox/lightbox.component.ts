import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface LightboxData {
  images: string[];
  currentIndex: number;
}

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="lightbox-container" (click)="close()">
      <button mat-icon-button class="close-btn" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>

      @if (images.length > 1) {
        <button mat-icon-button class="nav-btn prev" (click)="prev($event)">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <button mat-icon-button class="nav-btn next" (click)="next($event)">
          <mat-icon>chevron_right</mat-icon>
        </button>
      }

      <div class="image-wrapper" (click)="$event.stopPropagation()">
        <img 
          [src]="images[currentIndex()]" 
          [alt]="'Imagen ' + (currentIndex() + 1)"
          class="lightbox-image"
          (load)="onImageLoad()"
          [class.loaded]="imageLoaded()"
        />
        @if (!imageLoaded()) {
          <div class="image-loader">
            <mat-icon>hourglass_empty</mat-icon>
          </div>
        }
      </div>

      @if (images.length > 1) {
        <div class="counter">
          {{ currentIndex() + 1 }} / {{ images.length }}
        </div>
      }
    </div>
  `,
  styles: [`
    .lightbox-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      cursor: pointer;
    }

    .close-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      color: white;
      background: rgba(255, 255, 255, 0.1);
      z-index: 10;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: white;
      background: rgba(255, 255, 255, 0.1);
      z-index: 10;
    }

    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .nav-btn.prev {
      left: 20px;
    }

    .nav-btn.next {
      right: 20px;
    }

    .nav-btn mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .image-wrapper {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      cursor: default;
    }

    .lightbox-image {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 8px;
    }

    .lightbox-image.loaded {
      opacity: 1;
    }

    .image-loader {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
    }

    .image-loader mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .counter {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      background: rgba(0, 0, 0, 0.5);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    @media (max-width: 600px) {
      .nav-btn.prev {
        left: 10px;
      }

      .nav-btn.next {
        right: 10px;
      }

      .close-btn {
        top: 10px;
        right: 10px;
      }
    }
  `]
})
export class LightboxComponent {
  private dialogRef = inject(MatDialogRef<LightboxComponent>);
  private data = inject<LightboxData>(MAT_DIALOG_DATA);

  images = this.data.images;
  currentIndex = signal(this.data.currentIndex);
  imageLoaded = signal(false);

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  prev(event: Event): void {
    event.stopPropagation();
    this.imageLoaded.set(false);
    this.currentIndex.update(i => (i === 0 ? this.images.length - 1 : i - 1));
  }

  next(event: Event): void {
    event.stopPropagation();
    this.imageLoaded.set(false);
    this.currentIndex.update(i => (i === this.images.length - 1 ? 0 : i + 1));
  }

  close(): void {
    this.dialogRef.close();
  }
}
