import {Timestamp} from '@angular/fire/firestore';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'ADMIN' | 'USER';

  createdBy: string;
  createdAt: Timestamp;
  updatedBy: string;
  updatedAt: Timestamp;
}
