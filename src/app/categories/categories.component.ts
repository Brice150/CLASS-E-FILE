import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { firstCategories } from '../../assets/data/first-categories';
import { environment } from '../../environments/environment';
import { Category } from '../core/interfaces/category';
import { CategoryService } from '../core/services/category.service';
import { CategoryDialogComponent } from '../shared/components/category-dialog/category-dialog.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { CategoryCardComponent } from './category-card/category-card.component';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, MatProgressSpinnerModule, CategoryCardComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit, OnDestroy {
  imagePath: string = environment.imagePath;
  categoryService = inject(CategoryService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  categories: Category[] = [];
  toastr = inject(ToastrService);
  dialog = inject(MatDialog);
  overlay = inject(Overlay);

  ngOnInit(): void {
    this.categoryService
      .getCategories()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (categories: Category[]) => {
          if (categories?.length >= 1) {
            this.categories = categories
              .map((c) => ({
                ...c,
                creationDate:
                  c.creationDate instanceof Timestamp
                    ? c.creationDate.toDate()
                    : new Date(c.creationDate),
                articles: (c.articles ?? []).map((a) => ({
                  ...a,
                  creationDate:
                    a.creationDate instanceof Timestamp
                      ? a.creationDate.toDate()
                      : new Date(a.creationDate),
                })),
              }))
              .sort((a, b) => {
                const dateA = a.creationDate.getTime();
                const dateB = b.creationDate.getTime();
                return dateA !== dateB
                  ? dateA - dateB
                  : a.title.localeCompare(b.title);
              });

            this.loading = false;
          } else {
            this.initFirstCategories();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Categories', {
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

  initFirstCategories(): void {
    this.categoryService
      .addCategories(firstCategories)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Catégories', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  addCategory(): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Category) => {
          res.creationDate = new Date();
          return this.categoryService.addCategory(res);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: () => {
          this.toastr.info('Catégorie ajoutée', 'Catégories', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Catégories', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  deleteCategory(categoryId: string): void {
    if (this.categories.length !== 1) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: ['supprimer cette catégorie', ''],
        autoFocus: false,
        scrollStrategy: this.overlay.scrollStrategies.block(),
      });

      dialogRef
        .afterClosed()
        .pipe(
          filter((res: boolean) => res),
          switchMap(() => {
            return this.categoryService.deleteCategory(categoryId);
          }),
          takeUntil(this.destroyed$),
        )
        .subscribe({
          next: () => {
            this.categories = this.categories.filter(
              (category) => category.id !== categoryId,
            );
            this.toastr.info('Catégorie supprimée', 'Catégories', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Catégories', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    } else {
      this.toastr.error(
        'Vous devez avoir au moins une catégorie',
        'Catégories',
        {
          positionClass: 'toast-bottom-center',
          toastClass: 'ngx-toastr custom error',
        },
      );
    }
  }

  updateCategory(category: Category): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      data: structuredClone(category),
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Category) => {
          return this.categoryService.updateCategory(res);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: () => {
          this.toastr.info('Catégorie modifiée', 'Catégories', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Catégories', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}
