import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { FiguraService } from '../../../core/services/figura.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Figura, FiguraStats } from '../../../core/models/figura.model';
import { FiguraFormDialogComponent } from './figura-form-dialog/figura-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatPaginatorModule,
    RouterLink,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private figuraService = inject(FiguraService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  figuras = signal<Figura[]>([]);
  stats = signal<FiguraStats>({ totalFiguras: 0, totalInvertido: 0 });
  displayedColumns = ['imagen', 'nombre', 'precio', 'fecha', 'acciones'];
  
  loading = signal(false);
  currentPage = signal(1);
  pageSize = 20;
  totalItems = signal(0);
  isDark = this.themeService.isDark;

  sidenavOpened = signal(true);
  isMobile = signal(false);

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadFiguras();
    this.loadStats();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile();
    this.isMobile.set(window.innerWidth < 768);
    
    // Auto-cerrar en móvil, auto-abrir en desktop
    if (this.isMobile() && !wasMobile) {
      this.sidenavOpened.set(false);
    } else if (!this.isMobile() && wasMobile) {
      this.sidenavOpened.set(true);
    }
  }

  toggleSidenav(): void {
    this.sidenavOpened.update(v => !v);
  }

  closeSidenavOnMobile(): void {
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }

  loadFiguras(): void {
    this.loading.set(true);
    this.figuraService.getAll(this.currentPage(), this.pageSize).subscribe({
      next: (response) => {
        this.figuras.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.figuraService.getStats().subscribe({
      next: (stats) => this.stats.set(stats)
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize = event.pageSize;
    this.loadFiguras();
  }

  openForm(figura?: Figura): void {
    const dialogRef = this.dialog.open(FiguraFormDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: figura || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadFiguras();
        this.loadStats();
        this.snackBar.open(
          figura ? 'Figura actualizada' : 'Figura creada',
          'OK',
          { duration: 3000 }
        );
      }
    });
  }

  deleteFigura(figura: Figura): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar figura',
        message: `¿Estás seguro de eliminar "${figura.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.figuraService.delete(figura._id!).subscribe({
          next: () => {
            this.loadFiguras();
            this.loadStats();
            this.snackBar.open('Figura eliminada', 'OK', { duration: 3000 });
          }
        });
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
  }
}
