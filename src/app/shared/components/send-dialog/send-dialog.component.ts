import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Article } from '../../../core/interfaces/article';

@Component({
  selector: 'app-send-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './send-dialog.component.html',
  styleUrl: './send-dialog.component.css',
})
export class SendDialogComponent implements OnInit {
  sendForm!: FormGroup;
  fb = inject(FormBuilder);
  articles: Article[] = [];

  get articlesCtrl() {
    return this.sendForm.get('articles');
  }

  constructor(
    public dialogRef: MatDialogRef<SendDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: Article[],
  ) {}

  ngOnInit(): void {
    this.articles = this.data;

    this.sendForm = this.fb.group({
      receiverEmail: ['', [Validators.required, Validators.email]],
      message: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(200),
        ],
      ],
      articles: [
        this.articles.length === 1 ? [this.articles[0]] : [],
        Validators.required,
      ],
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (this.sendForm.valid) {
      this.dialogRef.close(this.sendForm.value);
    } else {
      this.sendForm.markAllAsTouched();
    }
  }
}
