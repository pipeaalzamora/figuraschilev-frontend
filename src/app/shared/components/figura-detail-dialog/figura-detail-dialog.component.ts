import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Figura } from '../../../core/models/figura.model';
import { LightboxComponent } from '../lightbox/lightbox.component';
import { AnalyticsService } from '../../../core/services/analytics.service';

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
  templateUrl: './figura-detail-dialog.component.html',
  styleUrl: './figura-detail-dialog.component.css',
  encapsulation: ViewEncapsulation.None
})
export class FiguraDetailDialogComponent {
  data = inject<Figura>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<FiguraDetailDialogComponent>);
  private dialog = inject(MatDialog);
  private analytics = inject(AnalyticsService);

  allImages: string[] = [this.data.imagenPrincipal, ...this.data.imagenesAdicionales];
  currentImage = signal(this.data.imagenPrincipal);
  currentIndex = signal(0);
  imageLoaded = signal(false);
  hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  selectImage(img: string, index: number): void {
    this.imageLoaded.set(false);
    this.currentImage.set(img);
    this.currentIndex.set(index);
  }

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  openLightbox(): void {
    this.dialog.open(LightboxComponent, {
      data: {
        images: this.allImages,
        currentIndex: this.currentIndex()
      },
      panelClass: 'lightbox-dialog',
      maxWidth: '100vw',
      maxHeight: '100vh',
      width: '100vw',
      height: '100vh'
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  shareWhatsApp(): void {
    const text = `Mira esta figura: ${this.data.nombre} - ${window.location.origin}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    this.analytics.trackShare('whatsapp', this.data._id || '');
  }

  shareInstagram(): void {
    // Instagram no permite compartir directamente, copiamos al portapapeles
    const text = `${this.data.nombre} - FigurasChileV`;
    navigator.clipboard.writeText(text);
    alert('Texto copiado! Pégalo en tu historia de Instagram');
    this.analytics.trackShare('instagram', this.data._id || '');
  }

  shareTikTok(): void {
    const text = `${this.data.nombre} - FigurasChileV`;
    navigator.clipboard.writeText(text);
    alert('Texto copiado! Compártelo en TikTok');
    this.analytics.trackShare('tiktok', this.data._id || '');
  }

  shareNative(): void {
    if (navigator.share) {
      navigator.share({
        title: this.data.nombre,
        text: `Mira esta figura: ${this.data.nombre}`,
        url: window.location.href
      });
      this.analytics.trackShare('native', this.data._id || '');
    }
  }
}
