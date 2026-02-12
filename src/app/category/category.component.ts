import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { Article } from '../core/interfaces/article';
import { Category } from '../core/interfaces/category';
import { CategoryService } from '../core/services/category.service';
import { EmptyCardComponent } from '../empty-card/empty-card.component';
import { ArticleDialogComponent } from '../shared/components/article-dialog/article-dialog.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { FilterDialogComponent } from '../shared/components/filter-dialog/filter-dialog.component';

@Component({
  selector: 'app-category',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatChipsModule,
    EmptyCardComponent,
    MatSelectModule,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit, AfterViewInit, OnDestroy {
  searchForm!: FormGroup;
  fb = inject(FormBuilder);
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
  displayedColumns: string[] = ['title', 'genres', 'grade'];
  dataSource = new MatTableDataSource(this.filteredArticles);
  _liveAnnouncer = inject(LiveAnnouncer);
  genres: string[] = [];
  @ViewChild(MatSort) sort!: MatSort;

  get genresCtrl() {
    return this.searchForm.get('genres');
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      search: ['', []],
      genres: [[], []],
    });

    this.searchForm.valueChanges
      .pipe(takeUntil(this.destroyed$))
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
            this.genres = this.category.articles.flatMap(
              (article) => article.genres,
            );
            this.applyAll();
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Erreur', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'genres':
          return [...(item.genres ?? [])]
            .sort((a, b) => a.localeCompare(b))
            .join(', ')
            .toLowerCase();

        case 'title':
          return item.title?.toLowerCase() ?? '';

        case 'grade':
          return item.grade ?? 0;

        default:
          return (item as any)[property];
      }
    };
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getSortedGenres(genres?: string[]): string[] {
    return [...(genres ?? [])].sort((a, b) => a.localeCompare(b));
  }

  trackByGenre(_: number, genre: string): string {
    return genre;
  }

  sortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(
        `Sorted ${sortState.active} ${sortState.direction}ending`,
      );
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  getHiddenGenresTitle(genres?: string[]): string {
    if (!genres || genres.length <= 2) return '';

    return this.getSortedGenres(genres).slice(2).join(', ');
  }

  applyAll(): void {
    if (!this.category?.articles) {
      this.dataSource.data = [];
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

    this.dataSource.data = articles;
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
            link: res.link ?? null,
          };

          this.category.articles.push(article);

          return this.categoryService.updateCategory(this.category);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: () => {
          this.toastr.info('Élément ajoutée', 'Élément', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Erreur', {
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
          this.toastr.info('Élément supprimé', 'Élément', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Erreur', {
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
          this.toastr.info('Élément modifié', 'Élément', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Erreur', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}
