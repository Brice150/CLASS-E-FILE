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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../core/services/authentication.service';

@Component({
  selector: 'app-forgot',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinner,
  ],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.css',
})
export class ForgotComponent implements OnInit, OnDestroy {
  forgotForm!: FormGroup;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  authenticationService = inject(AuthenticationService);
  router = inject(Router);
  destroyed$ = new Subject<void>();
  email?: string;
  loading = false;
  @Output() goToLoginEvent = new EventEmitter<void>();

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  passwordForgotten(): void {
    if (this.forgotForm.valid) {
      this.loading = true;
      this.authenticationService
        .passwordReset(this.forgotForm.value.email)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.email = this.forgotForm.value.email;
            this.loading = false;
            this.toastr.info(
              'Un email de réinitialisation de mot de passe a été envoyé à ' +
                this.email,
              'Mot de passe',
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
              if (error.message.includes('auth/invalid-email')) {
                this.toastr.error('Email non reconnu', 'Erreur', {
                  positionClass: 'toast-bottom-center',
                  toastClass: 'ngx-toastr custom error',
                });
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
      this.forgotForm.markAllAsTouched();
    }
  }

  goToLogin(): void {
    this.goToLoginEvent.emit();
  }
}
