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
import { Notification } from '../interfaces/notification';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  firestore = inject(Firestore);
  authenticationService = inject(AuthenticationService);
  notificationsCollection = collection(this.firestore, 'notifications');

  getNotifications(): Observable<Notification[]> {
    const receiverEmail = this.authenticationService.auth.currentUser?.email;
    const notificationsCollection = query(
      collection(this.firestore, 'notifications'),
      where('receiverEmail', '==', receiverEmail),
    );
    return collectionData(notificationsCollection, {
      idField: 'id',
    }) as Observable<Notification[]>;
  }

  addWelcomeNotification(): Observable<string | null> {
    const receiverEmail = this.authenticationService.auth.currentUser?.email;

    if (!receiverEmail) {
      return of(null);
    }

    const notificationsQuery = query(
      this.notificationsCollection,
      where('receiverEmail', '==', receiverEmail),
    );

    return collectionData(notificationsQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((notifications: any[]) => {
        if (notifications.length > 0) {
          return of(null);
        }

        const notification: Notification = {
          title: 'Bienvenue sur Class E-File !',
          message:
            'Vous pouvez commencer par ajouter des catégories et des éléments.',
          date: new Date(),
          receiverEmail,
          read: false,
        };

        const notificationDoc = doc(this.notificationsCollection);
        notification.id = notificationDoc.id;

        return from(setDoc(notificationDoc, { ...notification })).pipe(
          map(() => notification.id!),
        );
      }),
    );
  }

  sendArticles(notification: Notification): Observable<string> {
    const notificationToAdd: Notification = {
      title:
        this.authenticationService.auth.currentUser?.email! +
        ' vous a envoyé des éléments !',
      message: notification.message,
      date: new Date(),
      senderEmail: this.authenticationService.auth.currentUser?.email!,
      receiverEmail: notification.receiverEmail,
      read: false,
      articles: notification.articles,
    };

    const notificationDoc = doc(this.notificationsCollection);
    notificationToAdd.id = notificationDoc.id;
    return from(setDoc(notificationDoc, { ...notificationToAdd })).pipe(
      map(() => notificationToAdd.id!),
    );
  }

  addNotification(notification: Notification): Observable<string> {
    const notificationDoc = doc(this.notificationsCollection);
    notification.id = notificationDoc.id;
    return from(setDoc(notificationDoc, { ...notification })).pipe(
      map(() => notification.id!),
    );
  }

  updateNotification(notification: Notification): Observable<Notification> {
    if (!notification.id) {
      return from(Promise.reject('Identifiant de donnée partagée manquant'));
    }
    const notificationDoc = doc(
      this.firestore,
      `notifications/${notification.id}`,
    );
    return from(updateDoc(notificationDoc, { ...notification })).pipe(
      map(() => notification),
    );
  }

  deleteNotification(notificationId: string): Observable<void> {
    const notificationDoc = doc(
      this.firestore,
      `notifications/${notificationId}`,
    );
    return from(deleteDoc(notificationDoc));
  }

  deleteAllNotifications(): Observable<void> {
    const receiverEmail = this.authenticationService.auth.currentUser?.email;

    const notificationsQuery = query(
      this.notificationsCollection,
      where('receiverEmail', '==', receiverEmail),
    );

    return collectionData(notificationsQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((notifications: any[]) => {
        if (notifications.length === 0) {
          return of(undefined);
        }

        const deleteRequests = notifications.map(
          (notification: Notification) => {
            const notificationDoc = doc(
              this.firestore,
              `notifications/${notification.id}`,
            );
            return deleteDoc(notificationDoc);
          },
        );

        return combineLatest(deleteRequests);
      }),
      map(() => undefined),
    );
  }
}
