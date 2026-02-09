import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  Inject,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
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
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.css',
})
export class FilterDialogComponent implements OnInit {
  article: Article = {} as Article;
  categoryTitle?: string;
  toastr = inject(ToastrService);
  separatorKeysCodes: number[] = [ENTER, COMMA];
  currentGenre = model('');
  genres = signal<string[]>([]);
  availableGenres: string[] = [];
  filteredGenres = computed(() => {
    const value = this.currentGenre().toLowerCase();
    const all = this.availableGenres;
    return value ? all.filter((g) => g.toLowerCase().includes(value)) : all;
  });

  constructor(
    public dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { categoryTitle: string; article: Article; genres: string[] },
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.categoryTitle) {
      this.categoryTitle = this.data.categoryTitle;
      if (this.data.article) {
        this.article = this.data.article;
        this.genres.set(this.article.genres ? [...this.article.genres] : []);
        this.availableGenres = this.data.genres;
      }
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.genres().includes(value)) {
      this.genres.update((list) => [...list, value]);
    }
    this.currentGenre.set('');
  }

  remove(genre: string): void {
    this.genres.update((list) => list.filter((g) => g !== genre));
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (!this.genres().includes(value)) {
      this.genres.update((list) => [...list, value]);
    }
    this.currentGenre.set('');
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.article.genres = this.genres()?.length ? this.genres() : [];
    this.dialogRef.close(this.article);
  }
}
