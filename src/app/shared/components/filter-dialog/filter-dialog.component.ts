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
import { firstCategories } from '../../../../assets/data/first-categories';
import { BoardGameGenres } from '../../../core/enums/board-game-genres';
import { BookGenres } from '../../../core/enums/book-genres';
import { MovieGenres } from '../../../core/enums/movie-genres';
import { MusicGenres } from '../../../core/enums/music-genres';
import { VideoGameGenres } from '../../../core/enums/video-game-genres';
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
  moviesTitle = firstCategories[0].title;
  seriesTitle = firstCategories[1].title;
  musicTitle = firstCategories[2].title;
  boardGamesTitle = firstCategories[3].title;
  videoGamesTitle = firstCategories[4].title;
  booksTitle = firstCategories[5].title;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  currentGenre = model('');
  genres = signal<string[]>([]);
  filteredGenres = computed(() => {
    const value = this.currentGenre().toLowerCase();
    const all = this.getAvailableGenres();
    return value ? all.filter((g) => g.toLowerCase().includes(value)) : all;
  });

  constructor(
    public dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { categoryTitle: string; article: Article }
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.categoryTitle) {
      this.categoryTitle = this.data.categoryTitle;
      if (this.data.article) {
        this.article = this.data.article;
        this.genres.set(this.article.genres ? [...this.article.genres] : []);
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

  getAvailableGenres(): string[] {
    switch (this.categoryTitle) {
      case this.moviesTitle:
      case this.seriesTitle:
        return Object.values(MovieGenres);
      case this.musicTitle:
        return Object.values(MusicGenres);
      case this.boardGamesTitle:
        return Object.values(BoardGameGenres);
      case this.videoGamesTitle:
        return Object.values(VideoGameGenres);
      case this.booksTitle:
        return Object.values(BookGenres);
      default:
        return [];
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.article.genres = this.genres()?.length ? this.genres() : [];
    this.dialogRef.close(this.article);
  }
}
