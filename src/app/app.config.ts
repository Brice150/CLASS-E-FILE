import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  FirebaseApp,
  initializeApp,
  provideFirebaseApp,
} from '@angular/fire/app';
import { getAuth, GoogleAuthProvider, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import {
  FRENCH_DATE_FORMATS,
  FrenchDateAdapter,
} from './shared/french-date-adapter';

const firebaseApp: FirebaseApp = initializeApp(environment.firebase);

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideToastr(),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideFirebaseApp(() => firebaseApp),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    {
      provide: GoogleAuthProvider,
      useValue: new GoogleAuthProvider(),
    },
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: DateAdapter, useClass: FrenchDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: FRENCH_DATE_FORMATS },
  ],
};
