import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-welcome',
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent implements AfterViewInit {
  imagePath: string = environment.imagePath;
  router = inject(Router);
  @ViewChildren('feature') features!: QueryList<ElementRef>;
  @ViewChildren('section') sections!: QueryList<ElementRef>;
  @Output() selectPlanEvent = new EventEmitter<string>();

  ngAfterViewInit(): void {
    const featureObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const relativeDelay = index * 0.2;
            element.style.transitionDelay = `${relativeDelay}s`;
            element.classList.add('visible');
            featureObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    this.features.forEach((feature) => {
      featureObserver.observe(feature.nativeElement);
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const relativeDelay = index * 0.2;
            element.style.transitionDelay = `${relativeDelay}s`;
            element.classList.add('visible');
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    this.sections.forEach((section) => {
      sectionObserver.observe(section.nativeElement);
    });
  }

  selectPlan(planType: string): void {
    this.router.navigate(['/connect/' + planType]);
  }
}
