import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../core/services/authentication.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinner,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  authenticationService = inject(AuthenticationService);
  router = inject(Router);
  hide: boolean = true;
  invalidLogin: boolean = false;
  destroyed$ = new Subject<void>();
  loading = false;
  @Output() passwordForgottenEvent = new EventEmitter<void>();

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(40),
        ],
      ],
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  login(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authenticationService
        .login(this.loginForm.value)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.router.navigate(['/categories']);
          },
          error: (error: HttpErrorResponse) => {
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.loading = false;
              if (error.message.includes('auth/invalid-credential')) {
                this.invalidLogin = true;
                this.toastr.error(
                  'Mauvais email ou mot de passe',
                  'Life Control',
                  {
                    positionClass: 'toast-bottom-center',
                    toastClass: 'ngx-toastr custom error',
                  },
                );
                setTimeout(() => {
                  this.invalidLogin = false;
                }, 2000);
              } else if (error.message.includes('Email non vérifié')) {
                this.invalidLogin = true;
                this.toastr.error('Email non vérifié', 'Life Control', {
                  positionClass: 'toast-bottom-center',
                  toastClass: 'ngx-toastr custom error',
                });
                setTimeout(() => {
                  this.invalidLogin = false;
                }, 2000);
              } else {
                this.toastr.error(error.message, 'Erreur', {
                  positionClass: 'toast-bottom-center',
                  toastClass: 'ngx-toastr custom error',
                });
              }
            }
          },
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  loginWithGoogle(): void {
    this.loading = true;
    this.authenticationService
      .signInWithGoogle()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.loading = false;
            if (!error.message.includes('auth/popup-closed-by-user')) {
              this.toastr.error(error.message, 'Erreur', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          }
        },
      });
  }

  passwordForgotten(): void {
    this.passwordForgottenEvent.emit();
  }
}
