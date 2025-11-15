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
import { ArticleCardComponent } from './article-card/article-card.component';

@Component({
  selector: 'app-category',
  imports: [CommonModule, MatProgressSpinnerModule, ArticleCardComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit, OnDestroy {
  imagePath: string = environment.imagePath;
  categoryService = inject(CategoryService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  category: Category = {} as Category;
  toastr = inject(ToastrService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((params) => {
          const categoryId = params['id'];
          return this.categoryService.getCategory(categoryId);
        })
      )
      .subscribe({
        next: (category: Category | null) => {
          if (category) {
            this.category = category;
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

  addArticle(): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent);

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Article) => {
          this.loading = true;
          res.creationDate = new Date();
          //TODO
          return this.categoryService.updateCategory(this.category);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info('Élément ajoutée', 'Catégorie', {
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

  deleteArticle(articleId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'supprimer cet élément',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          //TODO
          return this.categoryService.updateCategory(this.category);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
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

  updateArticle(article: Article): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent, {
      data: structuredClone(article),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Article) => {
          this.loading = true;
          //TODO
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
}
