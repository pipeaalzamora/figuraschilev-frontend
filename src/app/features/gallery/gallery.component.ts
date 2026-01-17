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
import { ThemeService } from '../../core/services/theme.service';
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
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent implements OnInit {
  private figuraService = inject(FiguraService);
  private themeService = inject(ThemeService);
  private dialog = inject(MatDialog);
  private platformId = inject(PLATFORM_ID);

  figuras = signal<Figura[]>([]);
  loading = signal(true);
  searchTerm = '';
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  hasMore = signal(false);
  isDark = this.themeService.isDark;
  currentYear = new Date().getFullYear();

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

  toggleTheme(): void {
    this.themeService.toggleTheme();
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
