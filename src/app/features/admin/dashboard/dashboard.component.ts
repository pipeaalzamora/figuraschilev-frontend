import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { FiguraService } from '../../../core/services/figura.service';
import { AuthService } from '../../../core/services/auth.service';
import { Figura } from '../../../core/models/figura.model';
import { FiguraFormDialogComponent } from './figura-form-dialog/figura-form-dialog.component';

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
    RouterLink,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <mat-sidenav-container class="dashboard-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <h2>FigurasChileV</h2>
          <p>Panel Admin</p>
        </div>
        <mat-nav-list>
          <a mat-list-item class="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/">
            <mat-icon matListItemIcon>visibility</mat-icon>
            <span matListItemTitle>Ver Galería</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button (click)="logout()">
            <mat-icon>logout</mat-icon>
            Cerrar sesión
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <mat-toolbar color="primary">
          <span>Gestión de Figuras</span>
          <span class="spacer"></span>
          <button mat-raised-button (click)="openForm()">
            <mat-icon>add</mat-icon>
            Nueva Figura
          </button>
        </mat-toolbar>

        <div class="content-area">
          <div class="stats-cards">
            <div class="stat-card">
              <mat-icon>collections</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ figuras().length }}</span>
                <span class="stat-label">Total Figuras</span>
              </div>
            </div>
            <div class="stat-card">
              <mat-icon>attach_money</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ totalInvertido() | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                <span class="stat-label">Total Invertido</span>
              </div>
            </div>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="figuras()" class="figuras-table">
              <ng-container matColumnDef="imagen">
                <th mat-header-cell *matHeaderCellDef>Imagen</th>
                <td mat-cell *matCellDef="let figura">
                  <img [src]="figura.imagenPrincipal" [alt]="figura.nombre" class="table-image" />
                </td>
              </ng-container>

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let figura">{{ figura.nombre }}</td>
              </ng-container>

              <ng-container matColumnDef="precio">
                <th mat-header-cell *matHeaderCellDef>Precio</th>
                <td mat-cell *matCellDef="let figura">
                  {{ figura.precio | currency:'CLP':'symbol-narrow':'1.0-0' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="fecha">
                <th mat-header-cell *matHeaderCellDef>Fecha Compra</th>
                <td mat-cell *matCellDef="let figura">
                  {{ figura.fechaCompra | date:'shortDate' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let figura">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="openForm(figura)">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </button>
                    <button mat-menu-item (click)="deleteFigura(figura)">
                      <mat-icon>delete</mat-icon>
                      <span>Eliminar</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            @if (figuras().length === 0) {
              <div class="empty-table">
                <mat-icon>inbox</mat-icon>
                <p>No hay figuras registradas</p>
                <button mat-raised-button color="primary" (click)="openForm()">
                  Agregar primera figura
                </button>
              </div>
            }
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .dashboard-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
      background: #1a1a2e;
      color: white;
      display: flex;
      flex-direction: column;
    }

    .sidenav-header {
      padding: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .sidenav-header h2 {
      margin: 0;
      font-size: 1.3rem;
    }

    .sidenav-header p {
      margin: 4px 0 0;
      opacity: 0.7;
      font-size: 0.85rem;
    }

    mat-nav-list {
      flex: 1;
    }

    mat-nav-list a {
      color: rgba(255,255,255,0.8);
    }

    mat-nav-list a.active {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .sidenav-footer {
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .sidenav-footer button {
      color: rgba(255,255,255,0.7);
    }

    .main-content {
      background: #f5f5f5;
    }

    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .spacer {
      flex: 1;
    }

    .content-area {
      padding: 24px;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .stat-card mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .stat-label {
      color: #666;
      font-size: 0.85rem;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .figuras-table {
      width: 100%;
    }

    .table-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }

    .empty-table {
      padding: 60px 20px;
      text-align: center;
      color: #666;
    }

    .empty-table mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.5;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private figuraService = inject(FiguraService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  figuras = signal<Figura[]>([]);
  displayedColumns = ['imagen', 'nombre', 'precio', 'fecha', 'acciones'];

  totalInvertido = signal(0);

  ngOnInit(): void {
    this.loadFiguras();
  }

  loadFiguras(): void {
    this.figuraService.getAll().subscribe({
      next: (data) => {
        this.figuras.set(data);
        this.calculateTotal();
      },
      error: () => {
        // Datos de ejemplo
        this.figuras.set(this.getMockData());
        this.calculateTotal();
      }
    });
  }

  calculateTotal(): void {
    const total = this.figuras().reduce((sum, f) => sum + f.precio, 0);
    this.totalInvertido.set(total);
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
        this.snackBar.open(
          figura ? 'Figura actualizada' : 'Figura creada',
          'OK',
          { duration: 3000 }
        );
      }
    });
  }

  deleteFigura(figura: Figura): void {
    if (confirm(`¿Eliminar "${figura.nombre}"?`)) {
      this.figuraService.delete(figura._id!).subscribe({
        next: () => {
          this.loadFiguras();
          this.snackBar.open('Figura eliminada', 'OK', { duration: 3000 });
        },
        error: () => {
          // Mock delete
          this.figuras.update(list => list.filter(f => f._id !== figura._id));
          this.calculateTotal();
          this.snackBar.open('Figura eliminada', 'OK', { duration: 3000 });
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  private getMockData(): Figura[] {
    return [
      {
        _id: '1',
        nombre: 'Goku Super Saiyan',
        descripcionCorta: 'Figura de Goku en su transformación más icónica',
        descripcionLarga: 'Figura de colección de Goku en su forma Super Saiyan.',
        precio: 15000,
        imagenPrincipal: 'https://via.placeholder.com/100x100/667eea/ffffff?text=Goku',
        imagenesAdicionales: [],
        historia: 'Encontré esta figura en la feria.',
        fechaCompra: new Date('2024-03-15'),
        lugarCompra: 'Persa Bio Bio',
        categoria: 'Anime'
      },
      {
        _id: '2',
        nombre: 'Spider-Man Classic',
        descripcionCorta: 'El amigable vecino',
        descripcionLarga: 'Figura vintage de Spider-Man.',
        precio: 8000,
        imagenPrincipal: 'https://via.placeholder.com/100x100/e91e63/ffffff?text=Spidey',
        imagenesAdicionales: [],
        historia: 'Remate de juguetes.',
        fechaCompra: new Date('2024-02-20'),
        lugarCompra: 'Feria Santa Lucía',
        categoria: 'Comics'
      }
    ];
  }
}
