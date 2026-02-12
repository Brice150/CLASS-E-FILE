import { UpperCasePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { Breadcrumb } from '../core/interfaces/breadcrumb';
import { BreadcrumbService } from '../core/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule, UpperCasePipe, MatTooltipModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: Breadcrumb[] = [];
  breadcrumbService = inject(BreadcrumbService);
  router = inject(Router);
  destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbsFromActivatedRoute(
          this.router.routerState.root,
        );
      });

    this.breadcrumbService.breadcrumbs$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((crumbs) => (this.breadcrumbs = crumbs));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  buildBreadcrumbsFromActivatedRoute(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = [],
  ): Breadcrumb[] {
    for (const child of route.children) {
      const routeURL = child.snapshot.url.map((s) => s.path).join('/');

      if (routeURL) {
        url += `/${routeURL}`;
      }

      const routeData = child.routeConfig?.data;
      const data = routeData?.['breadcrumb'];

      let label = null;
      if (typeof data === 'function') {
        label = data(child.snapshot);
      } else {
        label = data;
      }

      if (label && routeURL) {
        breadcrumbs.push({ label, url });
      }

      this.buildBreadcrumbsFromActivatedRoute(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
