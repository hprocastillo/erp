import {Injectable, inject} from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from '@angular/fire/firestore';
import {from, Observable} from 'rxjs';
import {User} from './interfaces/user';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  /** Traer todos los usuarios (reactivo) **/
  getAll(): Observable<User[]> {
    const ref = collection(this.firestore, 'users');
    return collectionData(ref, {idField: 'uid'}) as Observable<User[]>;
  }

  /** Traer un usuario por uid **/
  getById(uid: string) {
    const docRef = doc(this.firestore, `users/${uid}`);
    return from(getDoc(docRef));
  }

  /** Crea un usuario en Firestore **/
  async create(
    user: Omit<User, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ): Promise<void> {
    const now = Timestamp.now();
    const currentUid = this.authService.user()?.uid;
    if (!currentUid) throw new Error('No hay usuario autenticado.');

    const docRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(docRef, {
      ...user,
      createdAt: now,
      updatedAt: now,
      createdBy: currentUid,
      updatedBy: currentUid
    });
  }

  /** Actualiza un usuario en Firestore **/
  async update(uid: string, data: Partial<Omit<User, 'updatedAt' | 'updatedBy'>>): Promise<void> {
    const now = Timestamp.now();
    const currentUid = this.authService.user()?.uid;
    if (!currentUid) throw new Error('No hay usuario autenticado.');

    const docRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(docRef, {
      ...data,
      updatedAt: now,
      updatedBy: currentUid
    });
  }

  /** Eliminar usuario **/
  async delete(uid: string) {
    const docRef = doc(this.firestore, `users/${uid}`);
    await deleteDoc(docRef);
  }
}
