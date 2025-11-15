import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Article } from '../../core/interfaces/article';

@Component({
  selector: 'app-article-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.css',
})
export class ArticleCardComponent {
  imagePath: string = environment.imagePath;
  readonly article = input.required<Article>();
  @Output() updateArticleEvent = new EventEmitter<void>();
  @Output() deleteArticleEvent = new EventEmitter<void>();

  update() {
    this.updateArticleEvent.emit();
  }

  delete(): void {
    this.deleteArticleEvent.emit();
  }
}
