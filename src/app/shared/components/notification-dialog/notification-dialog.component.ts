import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Notification } from '../../../core/interfaces/notification';

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

  unread(): void {
    this.dialogRef.close(true);
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
