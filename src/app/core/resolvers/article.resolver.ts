import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CategoryService } from '../services/category.service';
import { Article } from '../interfaces/article';

@Injectable({ providedIn: 'root' })
export class ArticleResolver implements Resolve<Article> {
  private categoryService = inject(CategoryService);

  resolve(route: ActivatedRouteSnapshot): Observable<Article> {
    const categoryId = route.paramMap.get('categoryId');
    const articleId = route.paramMap.get('articleId');

    if (!categoryId || !articleId) return of({} as Article);

    return this.categoryService.getCategory(categoryId).pipe(
      map((category) => {
        return (
          category?.articles.find((a) => Number(a.id) === Number(articleId)) ||
          ({} as Article)
        );
      }),
      catchError(() => of({} as Article)),
    );
  }
}
