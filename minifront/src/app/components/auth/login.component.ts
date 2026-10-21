import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isRegister = signal(false);
  isLoading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  loginEmail = '';
  loginPassword = '';

  regNom = '';
  regEmail = '';
  regPassword = '';
  regBio = '';
  regPhotoProfile = '';

  private auth: AuthService = inject(AuthService);

  constructor(private router: Router) {}

  switchToRegister(): void {
    this.isRegister.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');
  }

  switchToLogin(): void {
    this.isRegister.set(false);
    this.errorMsg.set('');
    this.successMsg.set('');
  }

  onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMsg.set('Please fill in all fields.');
      return;
    }

    this.errorMsg.set('');
    this.isLoading.set(true);

    this.auth.login(this.loginEmail, this.loginPassword).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: user => {
        if (user) {
          this.router.navigate(['/feed']);
        } else {
          this.errorMsg.set('Invalid email or password.');
        }
      },
      error: err => {
        if (err.status === 0) {
          this.errorMsg.set('Server unreachable.');
        } else if (err.status === 401 || err.status === 404) {
          this.errorMsg.set('Invalid email or password.');
        } else {
          this.errorMsg.set('Login failed.');
        }
      }
    });
  }

  onRegister(): void {
    if (!this.regNom || !this.regEmail || !this.regPassword) {
      this.errorMsg.set('Name, email, and password are required.');
      return;
    }

    this.errorMsg.set('');
    this.successMsg.set('');
    this.isLoading.set(true);

    this.auth.register({
      nom: this.regNom,
      email: this.regEmail,
      password: this.regPassword,
      bio: this.regBio,
      photoProfile: this.regPhotoProfile
    }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: ok => {
        if (ok) {
          this.successMsg.set('Account created');
          this.loginEmail = this.regEmail;
          setTimeout(() => this.switchToLogin(), 1000);
        } else {
          this.errorMsg.set('Registration failed.');
        }
      },
      error: err => {
        if (err.status === 0) {
          this.errorMsg.set('Server unreachable.');
        } else {
          this.errorMsg.set('Registration failed.');
        }
      }
    });
  }
}