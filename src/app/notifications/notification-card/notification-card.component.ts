import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { Notification } from '../../core/interfaces/notification';
import { CustomDatePipe } from '../../shared/pipes/custom-date.pipe';

@Component({
  selector: 'app-notification-card',
  imports: [CommonModule, CustomDatePipe],
  templateUrl: './notification-card.component.html',
  styleUrl: './notification-card.component.css',
})
export class NotificationCardComponent {
  readonly notification = input.required<Notification>();
  @Output() viewEvent = new EventEmitter<void>();
  @Output() deleteEvent = new EventEmitter<void>();

  view(): void {
    this.viewEvent.emit();
  }

  delete(): void {
    this.deleteEvent.emit();
  }
}
