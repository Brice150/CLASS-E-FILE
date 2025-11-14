import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../core/interfaces/category';
import { CategoryService } from '../core/services/category.service';

@Component({
  selector: 'app-category',
  imports: [CommonModule, MatProgressSpinnerModule],
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
}
