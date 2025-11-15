import { Routes } from '@angular/router';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryComponent } from './category/category.component';
import { ConnectComponent } from './connect/connect.component';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { ProfileComponent } from './profile/profile.component';
import { StatsComponent } from './stats/stats.component';
import { ArticleComponent } from './article/article.component';

export const routes: Routes = [
  { path: 'connect', component: ConnectComponent, canActivate: [noUserGuard] },
  {
    path: 'categories',
    component: CategoriesComponent,
    canActivate: [userGuard],
  },
  {
    path: 'categories/:categoryId/articles',
    component: CategoryComponent,
    canActivate: [userGuard],
  },
  {
    path: 'categories/:categoryId/articles/:articleId',
    component: ArticleComponent,
    canActivate: [userGuard],
  },
  { path: 'stats', component: StatsComponent, canActivate: [userGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [userGuard] },
  { path: '**', redirectTo: 'categories', pathMatch: 'full' },
];
