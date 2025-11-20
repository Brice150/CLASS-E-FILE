import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';
import { Article } from '../core/interfaces/article';
import { Category } from '../core/interfaces/category';
import { CategoryService } from '../core/services/category.service';
import { ArticleDialogComponent } from '../shared/components/article-dialog/article-dialog.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-article',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './article.component.html',
  styleUrl: './article.component.css',
})
export class ArticleComponent implements OnInit, OnDestroy {
  imagePath: string = environment.imagePath;
  categoryService = inject(CategoryService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  category: Category = {} as Category;
  article: Article = {} as Article;
  toastr = inject(ToastrService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  articleId?: number;
  showRecommendButton = false;

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((params) => {
          const categoryId = params['categoryId'];
          this.articleId = params['articleId'];

          return this.categoryService.getCategory(categoryId);
        })
      )
      .subscribe({
        next: (category: Category | null) => {
          if (category) {
            this.category = category;
            const index = this.category.articles.findIndex(
              (a) => Number(a.id) === Number(this.articleId)
            );

            if (index !== -1) {
              this.article = this.category.articles[index];
            }

            this.showRecommendButton =
              this.category.articles?.some(
                (article) => article.isRecommended
              ) ?? false;
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Catégorie', {
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

  deleteArticle(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'supprimer cet élément',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          const index = this.category.articles.findIndex(
            (a) => a.id === this.article.id
          );
          if (index !== -1) {
            this.category.articles.splice(index, 1);
          }
          return this.categoryService.updateCategory(this.category);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          console.log(this.router.url);

          this.router.navigate([
            '/categories/' + this.category.id + '/articles',
          ]);
          this.loading = false;
          this.toastr.info('Élément supprimé', 'Catégorie', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Catégorie', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  updateArticle(): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent, {
      data: structuredClone(this.article),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Article) => {
          this.loading = true;
          const index = this.category.articles.findIndex(
            (a) => a.id === res.id
          );
          if (index !== -1) {
            this.category.articles[index] = res;
          }
          return this.categoryService.updateCategory(this.category);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info('Élément modifié', 'Catégorie', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Catégorie', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  recommendArticle(): void {
    this.article.isRecommended = !this.article.isRecommended;

    this.categoryService
      .updateCategory(this.category)
      .pipe(takeUntil(this.destroyed$))
      .subscribe();
  }

  recommendAll(): void {}
}
