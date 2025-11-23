import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import Chart from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { Category } from '../core/interfaces/category';
import { CategoryService } from '../core/services/category.service';
import { Stats } from '../core/interfaces/stats';
import { Article } from '../core/interfaces/article';

@Component({
  selector: 'app-stats',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent implements OnInit, OnDestroy {
  categoryService = inject(CategoryService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  toastr = inject(ToastrService);
  datePipe: DatePipe = new DatePipe('fr');
  graph?: Chart<'line', number[], string>;
  dialog = inject(MatDialog);
  categories: Category[] = [];
  categoryTitle: string = 'all';
  stats: Stats = {} as Stats;

  ngOnInit(): void {
    this.categoryService
      .getCategories()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (categories: Category[]) => {
          if (categories?.length >= 1) {
            this.categories = categories.sort((a, b) => {
              const dateA =
                a.creationDate instanceof Date
                  ? a.creationDate.getTime()
                  : a.creationDate?.seconds * 1000 +
                    Math.floor((a.creationDate?.nanoseconds || 0) / 1_000_000);

              const dateB =
                b.creationDate instanceof Date
                  ? b.creationDate.getTime()
                  : b.creationDate?.seconds * 1000 +
                    Math.floor((b.creationDate?.nanoseconds || 0) / 1_000_000);

              if (dateA !== dateB) {
                return dateA - dateB;
              }

              return a.title.localeCompare(b.title);
            });
          }

          this.calculateStats();
          this.loading = false;
          this.displayGraph();
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Progress', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  displayGraph(): void {
    const graph = document.getElementById('graph') as HTMLCanvasElement | null;

    if (graph) {
      const articles =
        this.categoryTitle === 'all'
          ? this.categories.flatMap((c) => c.articles)
          : this.categories
              .filter((c) => c.title === this.categoryTitle)
              .flatMap((c) => c.articles);

      const buildKey = (d: Date): string =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(d.getDate()).padStart(2, '0')}`;

      const labels = [
        ...new Set(
          articles
            .map((a) => this.normalizeDay(this.toDate(a.creationDate)))
            .map((d) => buildKey(d))
        ),
      ]
        .sort()
        .map((key) => {
          const [y, m, day] = key.split('-');
          return this.datePipe.transform(`${y}-${m}-${day}`, 'dd/MM/yyyy')!;
        });

      this.graph = new Chart(graph, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Total',
              data: this.stats.totalArticlesByDate,
              borderColor: '#d12123',
              backgroundColor: '#d12123',
            },
            {
              label: 'Possédés',
              data: this.stats.totalOwnedArticlesByDate,
              borderColor: '#ffd700',
              backgroundColor: '#ffd700',
            },
            {
              label: 'En attente',
              data: this.stats.totalArticlesToWatchByDate,
              borderColor: '#000000',
              backgroundColor: '#000000',
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 16,
                  weight: 800,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem: any) => {
                  const value = tooltipItem.raw;
                  return `${value} article${value > 1 ? 's' : ''}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date de création',
                font: { size: 18, weight: 700 },
                color: '#d12123',
              },
              ticks: {
                color: 'black',
              },
              grid: {
                color: 'transparent',
              },
              border: {
                color: 'black',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Nombre cumulé',
                font: { size: 18, weight: 700 },
                color: '#d12123',
              },
              ticks: {
                color: 'black',
                callback: (value) => Math.round(Number(value)),
                stepSize: 1,
              },
              beginAtZero: true,
              grid: {
                color: 'black',
              },
              border: {
                color: 'black',
              },
            },
          },
        },
      });
    }
  }

  updateGraph(): void {
    if (this.graph) {
      this.calculateStats();

      const articles =
        this.categoryTitle === 'all'
          ? this.categories.flatMap((c) => c.articles)
          : this.categories
              .filter((c) => c.title === this.categoryTitle)
              .flatMap((c) => c.articles);

      const buildKey = (d: Date): string =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(d.getDate()).padStart(2, '0')}`;

      const labels = [
        ...new Set(
          articles
            .map((a) => this.normalizeDay(this.toDate(a.creationDate)))
            .map((d) => buildKey(d))
        ),
      ]
        .sort()
        .map((key) => {
          const [y, m, day] = key.split('-');
          return this.datePipe.transform(`${y}-${m}-${day}`, 'dd/MM/yyyy')!;
        });

      this.graph.data.labels = labels;
      this.graph.data.datasets[0].data = this.stats.totalArticlesByDate;
      this.graph.data.datasets[1].data = this.stats.totalOwnedArticlesByDate;
      this.graph.data.datasets[2].data = this.stats.totalArticlesToWatchByDate;
      this.graph.update();
    }
  }

  toDate(d: any): Date {
    if (!d) return new Date(0);
    if (d instanceof Date) return d;
    return new Date(
      d.seconds * 1000 + Math.floor((d.nanoseconds || 0) / 1_000_000)
    );
  }

  normalizeDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  calculateStats(): void {
    let allArticles =
      this.categoryTitle === 'all'
        ? this.categories.flatMap((c) => c.articles)
        : this.categories
            .filter((c) => c.title === this.categoryTitle)
            .flatMap((c) => c.articles);

    allArticles = allArticles.map((a) => ({
      ...a,
      creationDate: this.normalizeDay(this.toDate(a.creationDate)),
    }));

    allArticles.sort(
      (a, b) => a.creationDate.getTime() - b.creationDate.getTime()
    );

    const grouped = new Map<string, Article[]>();

    const buildKey = (d: Date): string =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

    for (const article of allArticles) {
      const key = buildKey(article.creationDate);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(article);
    }

    let runningTotal = 0;
    let runningOwned = 0;
    let runningWishlisted = 0;

    const totalArticlesByDate: number[] = [];
    const totalOwnedArticlesByDate: number[] = [];
    const totalArticlesToWatchByDate: number[] = [];

    const sortedKeys = [...grouped.keys()].sort();

    for (const key of sortedKeys) {
      const articlesOfDay = grouped.get(key)!;

      for (const article of articlesOfDay) {
        runningTotal++;
        if (article.isOwned) runningOwned++;
        if (article.isWishlisted) runningWishlisted++;
      }

      totalArticlesByDate.push(runningTotal);
      totalOwnedArticlesByDate.push(runningOwned);
      totalArticlesToWatchByDate.push(runningWishlisted);
    }

    this.stats.totalArticlesByDate = totalArticlesByDate;
    this.stats.totalOwnedArticlesByDate = totalOwnedArticlesByDate;
    this.stats.totalArticlesToWatchByDate = totalArticlesToWatchByDate;

    const now = new Date();

    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    this.stats.totalArticles = allArticles.length ?? 0;
    this.stats.totalAddedArticlesMonth =
      allArticles.filter((article) => article.creationDate >= oneMonthAgo)
        .length ?? 0;
    this.stats.totalAddedArticlesYear =
      allArticles.filter((article) => article.creationDate >= oneYearAgo)
        .length ?? 0;
  }
}
