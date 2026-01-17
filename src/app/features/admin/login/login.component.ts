import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  password = '';
  hidePassword = signal(true);
  error = signal('');
  loading = signal(false);
  isDark = this.themeService.isDark;

  onLogin(): void {
    this.loading.set(true);
    this.error.set('');
    
    this.authService.login(this.password).subscribe(success => {
      this.loading.set(false);
      if (success) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.error.set('Contraseña incorrecta');
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
