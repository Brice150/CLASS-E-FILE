import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  user,
} from '@angular/fire/auth';
import { from, Observable, throwError } from 'rxjs';
import { Authentication } from '../interfaces/authentication';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  auth = inject(Auth);
  user$ = user(this.auth);
  currentAuthenticationSig = signal<Authentication | null | undefined>(
    undefined,
  );

  register(auth: Authentication): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.auth,
      auth.email,
      auth.password!,
    ).then((response) => {
      this.currentAuthenticationSig.set({
        email: response.user.email!,
      });
    });

    return from(promise);
  }

  login(auth: Authentication): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.auth,
      auth.email,
      auth.password!,
    ).then((response) => {
      this.currentAuthenticationSig.set({
        email: response.user.email!,
      });
    });

    return from(promise);
  }

  signInWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.auth, provider).then((response) => {
      this.currentAuthenticationSig.set({
        email: response.user.email!,
      });
    });
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.auth);
    this.currentAuthenticationSig.set(null);

    return from(promise);
  }

  passwordReset(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.auth, email);
    return from(promise);
  }

  updatePassword(auth: Authentication): Observable<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      return from(Promise.reject('Utilisateur non connecté'));
    }

    if (!auth.password) {
      return from(Promise.reject('Mot de passe non renseigné'));
    }

    const promise = updatePassword(currentUser, auth.password).then(() => {
      this.currentAuthenticationSig.set({
        email: auth.email,
      });
    });

    return from(promise);
  }

  deleteAccount(): Observable<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      return from(Promise.reject('Utilisateur non connecté'));
    }

    const promise = deleteUser(currentUser);

    return from(promise);
  }
}
