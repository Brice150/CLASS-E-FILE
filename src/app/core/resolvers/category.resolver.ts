import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Category } from '../interfaces/category';
import { CategoryService } from '../services/category.service';

@Injectable({ providedIn: 'root' })
export class CategoryResolver implements Resolve<Category> {
  categoryService = inject(CategoryService);

  resolve(route: ActivatedRouteSnapshot): Observable<Category> {
    const id = route.paramMap.get('categoryId');
    if (!id) return of({} as Category);

    return this.categoryService
      .getCategory(id)
      .pipe(catchError(() => of({} as Category)));
  }
}
