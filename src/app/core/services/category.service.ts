import { inject, Injectable } from '@angular/core';
import {
  arrayUnion,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
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
import { Article } from '../interfaces/article';
import { Category } from '../interfaces/category';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  firestore = inject(Firestore);
  authenticationService = inject(AuthenticationService);
  categoriesCollection = collection(this.firestore, 'categories');

  getCategories(): Observable<Category[]> {
    const userId = this.authenticationService.auth.currentUser?.uid;
    const categoriesCollection = query(
      collection(this.firestore, 'categories'),
      where('userId', '==', userId),
    );
    return collectionData(categoriesCollection, {
      idField: 'id',
    }) as Observable<Category[]>;
  }

  getCategory(categoryId: string): Observable<Category> {
    const recipeDoc = doc(this.firestore, `categories/${categoryId}`);
    return docData(recipeDoc, { idField: 'id' }) as Observable<Category>;
  }

  addCategory(category: Category): Observable<string> {
    const categoriesDoc = doc(this.categoriesCollection);
    category.id = categoriesDoc.id;
    category.userId = this.authenticationService.auth.currentUser?.uid;

    return from(setDoc(categoriesDoc, { ...category })).pipe(
      map(() => category.id!),
    );
  }

  addCategories(categories: Category[]): Observable<void> {
    const writeOperations = categories.map((category) => {
      const categoryDoc = doc(this.categoriesCollection);
      category.id = categoryDoc.id;
      category.userId = this.authenticationService.auth.currentUser?.uid;
      return setDoc(categoryDoc, { ...category });
    });

    return combineLatest(writeOperations).pipe(map(() => undefined));
  }

  addElementsToCategory(
    category: Category,
    articles: Article[],
  ): Observable<void> {
    if (!category.id) {
      return from(Promise.reject('ID de catégorie manquant'));
    }
    const categoryDoc = doc(this.firestore, `categories/${category.id}`);

    return from(
      updateDoc(categoryDoc, {
        articles: arrayUnion(...articles),
      }),
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

  deleteAllCategories(): Observable<void> {
    const categoriesQuery = query(
      this.categoriesCollection,
      where('userId', '==', this.authenticationService.auth.currentUser?.uid),
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
            `categories/${category.id}`,
          );
          return deleteDoc(categoriesDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined),
    );
  }
}
