import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';




export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "erp-freeforall", appId: "1:178337635996:web:b32eb130467c9dc6351759", storageBucket: "erp-freeforall.firebasestorage.app", apiKey: "AIzaSyAo_GKBkULukj0YYiA6Zqa7zAbqubNbGN8", authDomain: "erp-freeforall.firebaseapp.com", messagingSenderId: "178337635996", measurementId: "G-W6WBW337DW" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage())]
};
