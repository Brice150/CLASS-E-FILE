import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Authentication } from '../../core/interfaces/authentication';

@Component({
  selector: 'app-account',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent {
  readonly auth = input.required<Authentication>();
  @Output() updateEvent = new EventEmitter<void>();
  @Output() deleteEvent = new EventEmitter<void>();

  update(): void {
    this.updateEvent.emit();
  }

  delete(): void {
    this.deleteEvent.emit();
  }
}
