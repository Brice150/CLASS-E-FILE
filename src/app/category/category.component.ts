import { Overlay } from '@angular/cdk/overlay';
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
import { FilterDialogComponent } from '../shared/components/filter-dialog/filter-dialog.component';
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
  isSortedActivated = false;
  isSortedDesc = false;
  isTouched = false;
  articleFilter: Article = {} as Article;
  overlay = inject(Overlay);

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      search: ['', []],
    });

    this.searchForm
      .get('search')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.applyAll();
      });

    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((params) => {
          const categoryId = params['categoryId'];
          return this.categoryService.getCategory(categoryId);
        }),
      )
      .subscribe({
        next: (category: Category | null) => {
          if (category) {
            this.category = category;
            this.category.articles ??= [];
            this.applyAll();
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

  applyAll(): void {
    if (!this.category?.articles) {
      this.filteredArticles = [];
      return;
    }

    const searchValue =
      this.searchForm.get('search')?.value?.toLowerCase() ?? '';
    const filters = this.articleFilter;

    let articles = this.category.articles.filter((article) => {
      let ok = true;

      if (filters.genres?.length) {
        ok = ok && filters.genres.every((g) => article.genres?.includes(g));
      }
      if (filters.isOwned) ok = ok && article.isOwned;
      if (filters.isPreferred) ok = ok && article.isPreferred;
      if (filters.isWishlisted) ok = ok && article.isWishlisted;

      return ok;
    });

    if (searchValue) {
      articles = articles.filter((a) =>
        a.title.toLowerCase().includes(searchValue),
      );
    }

    if (!this.isSortedActivated) {
      articles.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      articles.sort((a, b) =>
        this.isSortedDesc ? b.grade - a.grade : a.grade - b.grade,
      );
    }

    this.filteredArticles = articles;
  }

  addArticle(): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent, {
      data: {
        categoryTitle: this.category.title,
      },
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Article) => {
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
            link: res.link,
          };

          this.category.articles.push(article);

          return this.categoryService.updateCategory(this.category);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: () => {
          this.toastr.info('Élément ajoutée', 'Catégorie', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
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
      data: ['supprimer cet élément', ''],
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          const index = this.category.articles.findIndex(
            (a) => a.id === articleId,
          );
          if (index !== -1) {
            this.category.articles.splice(index, 1);
          }
          return this.categoryService.updateCategory(this.category);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: () => {
          this.toastr.info('Élément supprimé', 'Catégorie', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Catégorie', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  openFilter(): void {
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      data: {
        categoryTitle: this.category.title,
        article: this.articleFilter,
        genres: this.category.articles.flatMap((article) => article.genres),
      },
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res) => !!res))
      .subscribe((articleFilter: Article) => {
        this.filterArticles(articleFilter, true);
      });
  }

  filterArticles(articleFilter: Article, isTouched = true): void {
    this.isTouched = isTouched;
    this.articleFilter = articleFilter;
    this.applyAll();
  }

  sortArticles(): void {
    this.isSortedActivated = true;
    this.isSortedDesc = !this.isSortedDesc;
    this.isTouched = true;
    this.applyAll();
  }

  resetFilters(): void {
    this.isSortedActivated = false;
    this.isSortedDesc = false;
    this.isTouched = false;
    this.articleFilter = {} as Article;

    this.searchForm.get('search')?.setValue('');

    this.applyAll();
  }

  updateArticle(article: Article): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent, {
      data: {
        categoryTitle: this.category.title,
        article: structuredClone(article),
      },
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Article) => {
          const index = this.category.articles.findIndex(
            (a) => a.id === res.id,
          );
          if (index !== -1) {
            this.category.articles[index] = res;
          }
          return this.categoryService.updateCategory(this.category);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: () => {
          this.toastr.info('Élément modifié', 'Catégorie', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
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
