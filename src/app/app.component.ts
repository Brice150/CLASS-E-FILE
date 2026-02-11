import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { NavComponent } from './nav/nav.component';
import { AuthenticationService } from './core/services/authentication.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NavComponent, BreadcrumbComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  authenticationService = inject(AuthenticationService);
  router = inject(Router);
  toastr = inject(ToastrService);
  destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.authenticationService.user$
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (user) => {
          if (user && user.emailVerified) {
            this.authenticationService.currentAuthenticationSig.set({
              email: user.email!,
            });
          } else {
            this.authenticationService.currentAuthenticationSig.set(null);
          }
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Erreur', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  logout(): void {
    this.authenticationService
      .logout()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
          this.toastr.info('Déconnexion réussie', 'Déconnexion', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Erreur', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}
