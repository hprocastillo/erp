import {Timestamp} from '@angular/fire/firestore';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  firstLogin: Timestamp;
  lastLogin: Timestamp;
}
