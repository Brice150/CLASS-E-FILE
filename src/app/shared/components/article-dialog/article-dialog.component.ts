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
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { BoardGameGenres } from '../../../core/enums/board-game-genres';
import { BookGenres } from '../../../core/enums/book-genres';
import { DefaultCategories } from '../../../core/enums/default-categories';
import { MovieGenres } from '../../../core/enums/movie-genres';
import { MusicGenres } from '../../../core/enums/music-genres';
import { VideoGameGenres } from '../../../core/enums/video-game-genres';
import { Article } from '../../../core/interfaces/article';

@Component({
  selector: 'app-article-dialog',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    ReactiveFormsModule,
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
  separatorKeysCodes: number[] = [ENTER, COMMA];
  genres = signal<string[]>([]);
  articleForm!: FormGroup;
  fb = inject(FormBuilder);
  filteredGenres = computed(() => {
    const value =
      this.articleForm?.get('currentGenre')?.value?.toLowerCase() ?? '';

    const all = this.getAvailableGenres();

    return value ? all.filter((g) => g.toLowerCase().includes(value)) : all;
  });
  isUpdateMode = false;
  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  constructor(
    public dialogRef: MatDialogRef<ArticleDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { categoryTitle: string; article: Article },
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.categoryTitle) {
      this.categoryTitle = this.data.categoryTitle;
      if (this.data.article) {
        this.article = this.data.article;
        this.isUpdateMode = this.article && !!this.article.title;
        this.imagePreview = this.article?.image;
      }
    }

    this.articleForm = this.fb.group({
      title: [
        this.article?.title,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      description: [this.article?.description],
      link: [this.article?.link],
      currentGenre: [''],
      genres: [this.article?.genres ?? []],
      grade: [this.article?.grade ?? 0],
      isOwned: [this.article?.isOwned ?? false],
      isPreferred: [this.article?.isPreferred ?? false],
      isWishlisted: [this.article?.isWishlisted ?? false],
    });

    this.genres.set(this.articleForm.value.genres ?? []);
  }

  ngAfterViewInit() {
    setTimeout(() => this.autosize.resizeToFitContent(true));
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (!value) return;

    const genres = this.articleForm.get('genres')!.value as string[];

    if (!genres.includes(value)) {
      this.articleForm.get('genres')!.setValue([...genres, value]);
      this.genres.set([...genres, value]);
    }

    this.articleForm.get('currentGenre')!.setValue('');
  }

  remove(genre: string): void {
    const genres = this.articleForm.get('genres')!.value as string[];
    const updated = genres.filter((g) => g !== genre);

    this.articleForm.get('genres')!.setValue(updated);
    this.genres.set(updated);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;

    const genres = this.articleForm.get('genres')!.value as string[];

    if (!genres.includes(value)) {
      this.articleForm.get('genres')!.setValue([...genres, value]);
      this.genres.set([...genres, value]);
    }

    this.articleForm.get('currentGenre')!.setValue('');
  }

  getAvailableGenres(): string[] {
    switch (this.categoryTitle) {
      case DefaultCategories.FilmsSeries:
        return Object.values(MovieGenres);
      case DefaultCategories.Musiques:
        return Object.values(MusicGenres);
      case DefaultCategories.JeuxSociete:
        return Object.values(BoardGameGenres);
      case DefaultCategories.JeuxVideos:
        return Object.values(VideoGameGenres);
      case DefaultCategories.Livres:
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

    let grade = x < width / 2 ? starIndex + 0.5 : starIndex + 1;

    this.articleForm.get('grade')!.setValue(grade);
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
    const current = this.hoverGrade ?? this.articleForm.value.grade ?? 0;
    return star <= Math.floor(current);
  }

  isHalf(star: number): boolean {
    const current = this.hoverGrade ?? this.articleForm.value.grade ?? 0;
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
    if (!this.articleForm.valid) {
      this.toastr.error('Titre invalide', 'Erreur', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
      return;
    }

    const article: Article = {
      ...this.article,
      ...this.articleForm.value,
      genres: this.articleForm.value.genres ?? [],
      image: this.imagePreview,
    };

    this.dialogRef.close(article);
  }
}
