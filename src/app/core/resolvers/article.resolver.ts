import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Article } from '../interfaces/article';
import { CategoryService } from '../services/category.service';

@Injectable({ providedIn: 'root' })
export class ArticleResolver implements Resolve<Article> {
  categoryService = inject(CategoryService);

  resolve(route: ActivatedRouteSnapshot): Observable<Article> {
    const category = route.parent?.data['category'];
    const articleId = route.paramMap.get('articleId');

    if (!category || !articleId) return of({} as Article);

    const article = category.articles?.find(
      (a: Article) => a.id === +articleId,
    );

    return of(article ?? ({} as Article));
  }
}
