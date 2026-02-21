import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrService } from 'ngx-toastr';
import { Article } from '../../../core/interfaces/article';

@Component({
  selector: 'app-filter-dialog',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.css',
})
export class FilterDialogComponent implements OnInit {
  article: Article = {} as Article;
  categoryTitle?: string;
  toastr = inject(ToastrService);
  filterForm!: FormGroup;
  fb = inject(FormBuilder);

  constructor(
    public dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { categoryTitle: string; article: Article },
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.categoryTitle) {
      this.categoryTitle = this.data.categoryTitle;
      if (this.data.article) {
        this.article = this.data.article;
      }
    }

    this.filterForm = this.fb.group({
      isOwned: [this.article.isOwned],
      isPreferred: [this.article.isPreferred],
      isWishlisted: [this.article.isWishlisted],
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.article.isOwned = this.filterForm.get('isOwned')?.value;
    this.article.isPreferred = this.filterForm.get('isPreferred')?.value;
    this.article.isWishlisted = this.filterForm.get('isWishlisted')?.value;
    this.dialogRef.close(this.article);
  }
}
