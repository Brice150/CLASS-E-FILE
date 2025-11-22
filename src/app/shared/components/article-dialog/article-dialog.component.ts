import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  inject,
  Inject,
  model,
  OnInit,
  signal,
  ViewChild,
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
  selector: 'app-article-dialog',
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
  templateUrl: './article-dialog.component.html',
  styleUrl: './article-dialog.component.css',
})
export class ArticleDialogComponent implements OnInit, AfterViewInit {
  article: Article = {} as Article;
  categoryTitle?: string;
  toastr = inject(ToastrService);
  imagePreview: string | null = null;
  hoverGrade: number | null = null;
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
  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  constructor(
    public dialogRef: MatDialogRef<ArticleDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { categoryTitle: string; article: Article }
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.categoryTitle) {
      this.categoryTitle = this.data.categoryTitle;
      if (this.data.article) {
        this.article = this.data.article;
        this.imagePreview = this.article?.image;
        this.article.grade = this.article.grade ?? 0;
        this.genres.set(this.article.genres ? [...this.article.genres] : []);
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.autosize.resizeToFitContent(true));
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.genres.update((list) => [...list, value]);
    }
    this.currentGenre.set('');
  }

  remove(genre: string): void {
    this.genres.update((list) => list.filter((g) => g !== genre));
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.genres.update((list) => [...list, event.option.viewValue]);
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
      this.article.genres = this.genres();
      this.dialogRef.close(this.article);
    } else {
      this.toastr.info('Titre invalide', 'Élément', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }
}
