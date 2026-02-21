import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
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
import { Subject } from 'rxjs';
import { Article } from '../../../core/interfaces/article';

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
  articles: Article[] = [];
  destroyed$ = new Subject<void>();

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
      articles: [
        this.articles.length === 1 ? [this.articles[0]] : [],
        Validators.required,
      ],
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
}
