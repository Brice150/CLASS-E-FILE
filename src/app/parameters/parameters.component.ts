import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, filter, of, Subject, switchMap, takeUntil } from 'rxjs';
import { Authentication } from '../core/interfaces/authentication';
import { AuthenticationService } from '../core/services/authentication.service';
import { CategoryService } from '../core/services/category.service';
import { NotificationService } from '../core/services/notification.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PasswordDialogComponent } from '../shared/components/password-dialog/password-dialog.component';
import { AccountComponent } from './account/account.component';

@Component({
  selector: 'app-parameters',
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    AccountComponent,
  ],
  templateUrl: './parameters.component.html',
  styleUrl: './parameters.component.css',
})
export class ParametersComponent implements OnDestroy {
  toastr = inject(ToastrService);
  authenticationService = inject(AuthenticationService);
  categoryService = inject(CategoryService);
  notificationService = inject(NotificationService);
  dialog = inject(MatDialog);
  router = inject(Router);
  destroyed$ = new Subject<void>();
  loading: boolean = false;
  overlay = inject(Overlay);

  @ViewChild(AccountComponent)
  accountComponent!: AccountComponent;

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  updatePassword(): void {
    const dialogRef = this.dialog.open(PasswordDialogComponent, {
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((auth: Authentication) => {
          auth.email =
            this.authenticationService.currentAuthenticationSig()?.email!;
          return this.authenticationService.updatePassword(auth);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: () => {
          this.toastr.info('Le compte a été mis à jour', 'Compte', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          if (error.message.includes('auth/requires-recent-login')) {
            this.toastr.error(
              'Merci de vous déconnecter et de vous reconnecter pour effectuer cette action',
              'Compte',
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
        },
      });
  }

  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: [
        'supprimer votre compte',
        'Cette action supprimera toutes les données de tous les utilisateurs de votre compte !',
      ],
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          return this.categoryService.deleteAllCategories();
        }),
        switchMap(() => this.notificationService.deleteAllNotifications()),
        switchMap(() =>
          this.authenticationService.deleteAccount().pipe(
            catchError(() => {
              return of(undefined);
            }),
          ),
        ),
        switchMap(() =>
          this.authenticationService.logout().pipe(
            catchError(() => {
              return of(undefined);
            }),
          ),
        ),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
          this.toastr.info('Le compte a été supprimé', 'Compte', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (error.message.includes('auth/requires-recent-login')) {
            this.toastr.error(
              'Merci de vous déconnecter et de vous reconnecter pour effectuer cette action',
              'Compte',
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
        },
      });
  }
}
