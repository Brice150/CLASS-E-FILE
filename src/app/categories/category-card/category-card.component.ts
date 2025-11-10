import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Category } from '../../core/interfaces/category';

@Component({
  selector: 'app-category-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.css',
})
export class CategoryCardComponent {
  readonly category = input.required<Category>();
  @Output() updateCategoryEvent = new EventEmitter<void>();
  @Output() deleteCategoryEvent = new EventEmitter<void>();

  update() {
    this.updateCategoryEvent.emit();
  }

  delete(): void {
    this.deleteCategoryEvent.emit();
  }
}
