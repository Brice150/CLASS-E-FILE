import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
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
import { RecoDialogComponent } from '../shared/components/reco-dialog/reco-dialog.component';
import { ArticleCardComponent } from './article-card/article-card.component';

@Component({
  selector: 'app-category',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ArticleCardComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  fb = inject(FormBuilder);
  imagePath: string = environment.imagePath;
  categoryService = inject(CategoryService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  category: Category = {} as Category;
  filteredArticles: Article[] = [];
  toastr = inject(ToastrService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  isSortedDesc = false;
  isTouched = false;
  showRecommendButton = false;

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      search: ['', []],
    });

    this.searchForm
      .get('search')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((searchValue: string) => {
        this.filteredArticles = this.searchArticles(searchValue);
      });

    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((params) => {
          const categoryId = params['categoryId'];
          return this.categoryService.getCategory(categoryId);
        })
      )
      .subscribe({
        next: (category: Category | null) => {
          if (category) {
            this.category = category;
            this.filteredArticles = [...this.category.articles];
            this.resetFilters();

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

  searchArticles(searchValue: string): Article[] {
    if (!searchValue) {
      return [...this.category.articles];
    }

    return this.category.articles.filter((article) =>
      article.title.toLowerCase().includes(searchValue.toLowerCase())
    );
  }

  addArticle(): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent, {
      data: {
        categoryTitle: this.category.title,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Article) => {
          this.loading = true;

          const maxId =
            this.category.articles.length > 0
              ? Math.max(...this.category.articles.map((a) => a.id)) + 1
              : 0;

          const article: Article = {
            id: maxId,
            title: res.title,
            description: res.description ?? null,
            genres: res.genres ?? [],
            creationDate: new Date(),
            image: res.image,
            isOwned: res.isOwned ?? false,
            grade: res.grade ?? 0,
            isPreferred: res.isPreferred ?? false,
            isWishlisted: res.isWishlisted ?? false,
            isRecommended: res.isRecommended ?? false,
          };

          this.category.articles.push(article);

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
          const index = this.category.articles.findIndex(
            (a) => a.id === articleId
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

  filterArticles(): void {
    this.isTouched = true;
    //TODO
  }

  sortArticles(): void {
    this.isSortedDesc = !this.isSortedDesc;
    this.isTouched = true;
    if (this.isSortedDesc) {
      this.filteredArticles.sort((a, b) => b.grade - a.grade);
    } else {
      this.filteredArticles.sort((a, b) => a.grade - b.grade);
    }
  }

  resetFilters(): void {
    this.isSortedDesc = false;
    this.isTouched = false;
    this.filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
  }

  recommendArticle(article: Article): void {
    article.isRecommended = !article.isRecommended;

    this.categoryService
      .updateCategory(this.category)
      .pipe(takeUntil(this.destroyed$))
      .subscribe();
  }

  updateArticle(article: Article): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent, {
      data: {
        categoryTitle: this.category.title,
        article: structuredClone(article),
      },
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

  cleanAll(): void {
    const dialogRef = this.dialog.open(RecoDialogComponent, {
      data: structuredClone(
        this.category.articles.filter((article) => article.isRecommended)
      ),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap(() => {
          this.loading = true;
          this.category.articles.forEach((article) => {
            article.isRecommended = false;
          });
          return this.categoryService.updateCategory(this.category);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info('Recommandations nettoyées', 'Catégorie', {
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
