import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import {
  combineLatest,
  from,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';
import { Category } from '../interfaces/category';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  categoriesCollection = collection(this.firestore, 'categories');

  getCategories(): Observable<Category[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const categoriesCollection = query(
      collection(this.firestore, 'categories'),
      where('userId', '==', userId)
    );
    return collectionData(categoriesCollection, {
      idField: 'id',
    }) as Observable<Category[]>;
  }

  getCategory(categoryId: string): Observable<Category | null> {
    const userId = this.userService.auth.currentUser?.uid;
    if (!userId) return of(null);

    const categoriesQuery = query(
      this.categoriesCollection,
      where('userId', '==', userId),
      where('id', '==', categoryId)
    );

    return collectionData(categoriesQuery, { idField: 'id' }).pipe(
      map((categories) => (categories.length > 0 ? categories[0] : null))
    ) as Observable<Category | null>;
  }

  addCategory(category: Category): Observable<string> {
    const categoriesDoc = doc(this.categoriesCollection);
    category.id = categoriesDoc.id;
    category.userId = this.userService.auth.currentUser?.uid;

    return from(setDoc(categoriesDoc, { ...category })).pipe(
      map(() => category.id!)
    );
  }

  updateCategory(category: Category): Observable<void> {
    if (!category.id) {
      return from(Promise.reject('ID de catégorie manquant'));
    }
    const categoriesDoc = doc(this.firestore, `categories/${category.id}`);
    return from(updateDoc(categoriesDoc, { ...category }));
  }

  deleteCategory(categoryId: string): Observable<void> {
    const categoriesDoc = doc(this.firestore, `categories/${categoryId}`);
    return from(deleteDoc(categoriesDoc));
  }

  deleteUserCategories(): Observable<void> {
    const categoriesQuery = query(
      this.categoriesCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(categoriesQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((category: any[]) => {
        if (category.length === 0) {
          return of(undefined);
        }

        const deleteRequests = category.map((category: Category) => {
          const categoriesDoc = doc(
            this.firestore,
            `categories/${category.id}`
          );
          return deleteDoc(categoriesDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
