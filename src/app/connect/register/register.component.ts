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
  AbstractControl,
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
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  authenticationService = inject(AuthenticationService);
  router = inject(Router);
  hide: boolean = true;
  hideDuplicate: boolean = true;
  destroyed$ = new Subject<void>();
  email?: string;
  loading = false;
  @Output() goToLoginEvent = new EventEmitter<void>();

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(40),
          ],
        ],
        passwordConfirmation: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(40),
          ],
        ],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  passwordMatchValidator(control: AbstractControl): void {
    const password = control.get('password')?.value;
    const passwordConfirmation = control.get('passwordConfirmation')?.value;

    if (
      control.get('password')!.valid &&
      passwordConfirmation &&
      passwordConfirmation !== '' &&
      password !== passwordConfirmation &&
      !control.get('passwordConfirmation')!.hasError('minlength') &&
      !control.get('passwordConfirmation')!.hasError('maxlength')
    ) {
      control
        .get('passwordConfirmation')
        ?.setErrors({ passwordMismatch: true });
    }
  }

  register(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.authenticationService
        .register(this.registerForm.value)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.email = this.registerForm.value.email;
            this.loading = false;
            this.toastr.info(
              'Un email de vérification a été envoyé à ' + this.email,
              'Bienvenue',
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom info',
              },
            );
          },
          error: (error: HttpErrorResponse) => {
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.loading = false;
              if (error.message.includes('auth/email-already-in-use')) {
                this.toastr.error(
                  "L'email est déjà connu dans Life Control",
                  'Life Control',
                  {
                    positionClass: 'toast-bottom-center',
                    toastClass: 'ngx-toastr custom error',
                  },
                );
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
      this.registerForm.markAllAsTouched();
    }
  }

  registerWithGoogle(): void {
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

  goToLogin(): void {
    this.goToLoginEvent.emit();
  }
}
