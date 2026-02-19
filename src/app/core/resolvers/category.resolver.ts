import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { CategoryService } from '../services/category.service';
import { Category } from '../interfaces/category';

@Injectable({ providedIn: 'root' })
export class CategoryResolver implements Resolve<Category> {
  private categoryService = inject(CategoryService);

  resolve(route: ActivatedRouteSnapshot): Observable<Category> {
    const id = route.paramMap.get('categoryId');
    if (!id) return of({} as Category);

    return this.categoryService
      .getCategory(id)
      .pipe(catchError(() => of({} as Category)));
  }
}
