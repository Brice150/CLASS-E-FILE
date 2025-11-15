import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { Category } from '../../../core/interfaces/category';
import { Article } from '../../../core/interfaces/article';

@Component({
  selector: 'app-article-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './article-dialog.component.html',
  styleUrl: './article-dialog.component.css',
})
export class ArticleDialogComponent implements OnInit {
  article: Article = {} as Article;
  toastr = inject(ToastrService);
  imagePreview: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<ArticleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Article
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.article = this.data;
      this.imagePreview = this.article?.image;
    }
  }

  addPicture(files: File[]): void {
    for (let file of files) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const maxDimension = 1200;
          const width = img.width;
          const height = img.height;
          let newWidth, newHeight;

          if (width > height) {
            newWidth = Math.min(width, maxDimension);
            newHeight = (height / width) * newWidth;
          } else {
            newHeight = Math.min(height, maxDimension);
            newWidth = (width / height) * newHeight;
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx!.drawImage(img, 0, 0, newWidth, newHeight);
          let quality = 0.7;
          let dataURL = canvas.toDataURL('image/jpeg', quality);

          this.imagePreview = dataURL;

          this.toastr.info('Image ajoutée', 'Élément', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        };
      };
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (this.article.title) {
      this.article.image = this.imagePreview;
      this.dialogRef.close(this.article);
    } else {
      this.toastr.info('Élément Invalide', 'Élément', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }
}
