import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { filter } from 'rxjs';
import { Notification } from '../../../core/interfaces/notification';
import { ReceiveDialogComponent } from '../receive-dialog/receive-dialog.component';

@Component({
  selector: 'app-notification-dialog',
  imports: [CommonModule],
  templateUrl: './notification-dialog.component.html',
  styleUrl: './notification-dialog.component.css',
})
export class NotificationDialogComponent implements OnInit {
  notification: Notification = {} as Notification;
  dialog = inject(MatDialog);
  overlay = inject(Overlay);

  constructor(
    public dialogRef: MatDialogRef<NotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Notification,
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.notification = this.data;
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ReceiveDialogComponent, {
      data: this.notification.articles,
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe((res) => {
        this.dialogRef.close(res);
      });
  }

  unread(): void {
    this.dialogRef.close(true);
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
