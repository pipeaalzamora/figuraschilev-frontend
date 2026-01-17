import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Figura } from '../../../core/models/figura.model';
import { LightboxComponent } from '../lightbox/lightbox.component';

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
  styleUrl: './figura-detail-dialog.component.css'
})
export class FiguraDetailDialogComponent {
  data = inject<Figura>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<FiguraDetailDialogComponent>);
  private dialog = inject(MatDialog);

  allImages: string[] = [this.data.imagenPrincipal, ...this.data.imagenesAdicionales];
  currentImage = signal(this.data.imagenPrincipal);
  currentIndex = signal(0);
  imageLoaded = signal(false);

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
}
