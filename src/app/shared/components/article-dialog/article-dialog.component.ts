import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
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
export class ArticleDialogComponent implements OnInit, AfterViewInit {
  article: Article = {} as Article;
  toastr = inject(ToastrService);
  imagePreview: string | null = null;
  hoverGrade: number | null = null;
  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  constructor(
    public dialogRef: MatDialogRef<ArticleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Article
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.article = this.data;
      this.imagePreview = this.article?.image;
      this.article.grade = this.article.grade ?? 0;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.autosize.resizeToFitContent(true));
  }

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  setGradeFromMouse(event: MouseEvent, starIndex: number) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;

    if (x < width / 2) {
      this.article.grade = starIndex + 0.5;
    } else {
      this.article.grade = starIndex + 1;
    }
  }

  setHoverFromMouse(event: MouseEvent, starIndex: number) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;

    if (x < width / 2) {
      this.hoverGrade = starIndex + 0.5;
    } else {
      this.hoverGrade = starIndex + 1;
    }
  }

  clearHover() {
    this.hoverGrade = null;
  }

  isFull(star: number): boolean {
    const current = this.hoverGrade ?? this.article.grade ?? 0;
    return star <= Math.floor(current);
  }

  isHalf(star: number): boolean {
    const current = this.hoverGrade ?? this.article.grade ?? 0;
    return star === Math.ceil(current) && current % 1 >= 0.5;
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
