import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { Article } from '../../../core/interfaces/article';
import { Category } from '../../../core/interfaces/category';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-receive-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './receive-dialog.component.html',
  styleUrl: './receive-dialog.component.css',
})
export class ReceiveDialogComponent implements OnInit, OnDestroy {
  receiveForm!: FormGroup;
  fb = inject(FormBuilder);
  categoryService = inject(CategoryService);
  toastr = inject(ToastrService);
  categories: Category[] = [];
  articles: Article[] = [];
  destroyed$ = new Subject<void>();
  loading: boolean = true;

  get articlesCtrl() {
    return this.receiveForm.get('articles');
  }

  constructor(
    public dialogRef: MatDialogRef<ReceiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: Article[],
  ) {}

  ngOnInit(): void {
    this.articles = this.data;
    this.receiveForm = this.fb.group({
      category: ['', Validators.required],
      articles: [
        this.articles.length === 1 ? [this.articles[0]] : [],
        Validators.required,
      ],
    });

    this.categoryService
      .getCategories()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (categories: Category[]) => {
          this.categories = categories
            .map((c) => ({
              ...c,
              creationDate: this.toDate(c.creationDate),
            }))
            .sort((a, b) => {
              const dateA = a.creationDate.getTime();
              const dateB = b.creationDate.getTime();
              return dateA !== dateB
                ? dateA - dateB
                : a.title.localeCompare(b.title);
            });
          this.loading = false;
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

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (this.receiveForm.valid) {
      this.dialogRef.close(this.receiveForm.value);
    } else {
      this.receiveForm.markAllAsTouched();
    }
  }

  toDate(value: any): Date {
    if (!value) return new Date();

    if (value instanceof Timestamp) {
      return value.toDate();
    }

    if (value.seconds !== undefined) {
      return new Date(value.seconds * 1000);
    }

    return new Date(value);
  }
}
