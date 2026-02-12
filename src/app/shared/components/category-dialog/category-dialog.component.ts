import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { DefaultCategories } from '../../../core/enums/default-categories';
import { Category } from '../../../core/interfaces/category';

@Component({
  selector: 'app-category-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.css',
})
export class CategoryDialogComponent implements OnInit {
  category: Category = {} as Category;
  isUpdateMode = false;
  toastr = inject(ToastrService);
  imagePreview: string | null = null;
  allTitles = signal<string[]>(Object.values(DefaultCategories));

  filteredTitles = signal<string[]>([]);

  constructor(
    public dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Category,
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.category = this.data;
      this.isUpdateMode = this.category && !!this.category.title;
      this.imagePreview = this.category?.image;
    }
    this.filteredTitles.set(this.allTitles());
  }

  filterTitles(value: string | null) {
    if (!value || value.trim() === '') {
      this.filteredTitles.set(this.allTitles());
      return;
    }

    const filterValue = value.toLowerCase();

    this.filteredTitles.set(
      this.allTitles().filter((title) =>
        title.toLowerCase().includes(filterValue),
      ),
    );
  }

  selectTitle(event: any) {
    this.category.title = event.option.value;
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

          this.toastr.info('Image ajoutée', 'Image', {
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
    if (this.category.title) {
      this.category.image = this.imagePreview;
      this.dialogRef.close(this.category);
    } else {
      this.toastr.error('Titre Invalide', 'Erreur', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }
}
