import {Timestamp} from '@angular/fire/firestore';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'ADMINISTRADOR' | 'USUARIO';
  lastLogin: Timestamp;

  createdBy: string;
  createdAt: Timestamp;
  updatedBy: string;
  updatedAt: Timestamp;
}
