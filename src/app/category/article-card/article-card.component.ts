import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { Article } from '../../core/interfaces/article';

@Component({
  selector: 'app-article-card',
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatChipsModule,
  ],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.css',
})
export class ArticleCardComponent {
  readonly article = input.required<Article>();
  readonly categoryId = input.required<string>();
  @Output() updateArticleEvent = new EventEmitter<void>();
  @Output() deleteArticleEvent = new EventEmitter<void>();

  getStars(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];

    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('full');
      } else if (rating >= i - 0.5) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }

  update(): void {
    this.updateArticleEvent.emit();
  }

  delete(): void {
    this.deleteArticleEvent.emit();
  }
}
