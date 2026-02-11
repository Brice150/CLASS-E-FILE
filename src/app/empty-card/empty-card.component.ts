import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-card',
  imports: [CommonModule],
  templateUrl: './empty-card.component.html',
  styleUrl: './empty-card.component.css',
})
export class EmptyCardComponent {
  readonly text = input.required<string>();
}
