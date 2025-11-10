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
  category: Category = {} as Category;

  ngOnInit(): void {
    this.categoryService
      .getCategories()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (categories: Category[]) => {
          if (categories?.length >= 0) {
            this.categories = categories;
            if (!this.category || !this.category.title) {
              this.category = this.categories[0];
            }
          }

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
    /*
    const graph = document.getElementById('graph') as HTMLCanvasElement | null;
    if (graph) {
      this.graph = new Chart(graph, {
        type: 'line',
        data: {
          labels: this.category..map(
            (categ) => this.datePipe.transform(measure.date, 'dd/MM/yyyy')!
          ),
          datasets: [
            {
              label: 'Weight (kg)',
              data: this.filteredMeasures.map((measure) => measure.weight),
            },
            {
              label: 'Muscle (%)',
              data: this.filteredMeasures.map((measure) => measure.muscle),
            },
            {
              label: 'Fat (%)',
              data: this.filteredMeasures.map((measure) => measure.fat),
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
                  let currentValue = (
                    Math.round(tooltipItem.raw * 10) / 10
                  ).toLocaleString('fr-FR', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  });

                  const unit = tooltipItem.datasetIndex === 0 ? 'kg' : '%';

                  return `${currentValue} ${unit}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
                font: {
                  size: 18,
                  weight: 800,
                },
                color: '#38a95a',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Value (kg or %)',
                font: {
                  size: 18,
                  weight: 800,
                },
                color: '#38a95a',
              },
            },
          },
        },
      });
    }
      */
  }

  updateGraph(): void {
    /*
    if (this.graph) {
      this.graph.data.labels = this.filteredMeasures.map(
        (measure) => this.datePipe.transform(measure.date, 'dd/MM/yyyy')!
      );
      this.graph.data.datasets[0].data = this.filteredMeasures.map(
        (measure) => measure.weight
      );
      this.graph.data.datasets[1].data = this.filteredMeasures.map(
        (measure) => measure.muscle
      );
      this.graph.data.datasets[2].data = this.filteredMeasures.map(
        (measure) => measure.fat
      );
      this.graph.update();
    }
      */
  }
}
