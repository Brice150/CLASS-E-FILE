import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { Notification } from '../core/interfaces/notification';
import { NotificationService } from '../core/services/notification.service';
import { EmptyCardComponent } from '../empty-card/empty-card.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationCardComponent } from './notification-card/notification-card.component';

@Component({
  selector: 'app-notifications',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    NotificationCardComponent,
    EmptyCardComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  toastr = inject(ToastrService);
  notificationService = inject(NotificationService);
  dialog = inject(MatDialog);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  notifications: Notification[] = [];
  overlay = inject(Overlay);

  ngOnInit(): void {
    this.notificationService
      .getNotifications()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (notifications: Notification[]) => {
          this.notifications = notifications
            .map((notification) => ({
              ...notification,
              date:
                notification.date instanceof Timestamp
                  ? notification.date.toDate()
                  : new Date(notification.date),
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime());
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
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

  viewNotification(notification: Notification): void {
    /*
    if (!notification.read) {
      notification.read = true;
      this.notificationService
        .updateNotification(notification)
        .pipe(takeUntil(this.destroyed$))
        .subscribe();
    }

    const dialogRef = this.dialog.open(NotificationDialogComponent, {
      data: notification,
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    let isUpdated = false;

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res) => {
          if (res === true) {
            notification.read = false;
            isUpdated = true;
            return this.notificationService.updateNotification(notification);
          }
          return of(res);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: () => {
          if (!isUpdated) {
            this.toastr.info('La notification a été traitée', 'Notification', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
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
      */
  }

  openDialog(notificationId: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: ['supprimer cette notification', ''],
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          return this.notificationService.deleteNotification(notificationId);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: () => {
          this.toastr.info('La notification a été supprimée', 'Notification', {
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
