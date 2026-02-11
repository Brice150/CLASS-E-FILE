import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, takeUntil } from 'rxjs';
import { Notification } from '../core/interfaces/notification';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  @Output() logoutEvent = new EventEmitter<void>();
  menuOpen = false;
  router = inject(Router);
  notificationService = inject(NotificationService);
  toastr = inject(ToastrService);
  notificationNumber: number = 0;
  destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.menuOpen) {
          this.menuOpen = false;
        }
      });

    this.notificationService
      .getNotifications()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (notifications: Notification[]) => {
          this.notificationNumber = notifications.filter(
            (notification) => !notification.read,
          ).length;
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

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.logoutEvent.emit();
  }
}
