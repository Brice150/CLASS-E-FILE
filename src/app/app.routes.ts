import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { ArticleComponent } from './article/article.component';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryComponent } from './category/category.component';
import { ConnectComponent } from './connect/connect.component';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { NotificationsComponent } from './notifications/notifications.component';
import { ParametersComponent } from './parameters/parameters.component';
import { StatsComponent } from './stats/stats.component';
import { WelcomeComponent } from './welcome/welcome.component';

export const routes: Routes = [
  // WELCOME
  {
    path: '',
    component: WelcomeComponent,
    canActivate: [noUserGuard],
  },

  // CONNECT
  {
    path: 'connect/:type',
    component: ConnectComponent,
    canActivate: [noUserGuard],
  },

  // CATEGORIES
  {
    path: 'categories',
    canActivate: [userGuard],
    data: { breadcrumb: 'Catégories' },
    children: [
      {
        path: '',
        component: CategoriesComponent,
      },

      {
        path: ':categoryId',
        component: CategoryComponent,
        data: {
          breadcrumb: (route: ActivatedRouteSnapshot) =>
            route.paramMap.get('categoryId'),
        },
        children: [
          {
            path: ':articleId',
            component: ArticleComponent,
            data: {
              breadcrumb: (route: ActivatedRouteSnapshot) =>
                route.paramMap.get('articleId'),
            },
          },
        ],
      },
    ],
  },

  // STATS
  {
    path: 'stats',
    component: StatsComponent,
    canActivate: [userGuard],
    data: { breadcrumb: 'Stats' },
  },

  // NOTIFICATIONS
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [userGuard],
    data: { breadcrumb: 'Notifications' },
  },

  // PARAMETERS
  {
    path: 'parameters',
    component: ParametersComponent,
    canActivate: [userGuard],
    data: { breadcrumb: 'Paramètres' },
  },

  { path: '**', redirectTo: 'categories', pathMatch: 'full' },
];
