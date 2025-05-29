import {computed, inject, Injectable, signal} from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc
} from '@angular/fire/firestore';
import {from, Observable, Subscription} from 'rxjs';
import {User} from './interfaces/user';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  /** injects **/
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  // Obtener todos los usuarios (para filtros select)
  getAllUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'uid' }) as Observable<User[]>;
  }

  /** Trae un usuario por UID (solo cuando lo necesites individualmente) **/
  getUserById(uid: string) {
    const docRef = doc(this.firestore, `users/${uid}`);
    return from(getDoc(docRef));
  }

  /** Crea un usuario en Firestore **/
  async createUser(
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
    // Si quieres que el cache se actualice instantáneamente sin esperar el evento de Firestore:
    // this.listenAllUsers();
  }

  /** Actualiza un usuario en Firestore **/
  async updateUser(uid: string, data: Partial<Omit<User, 'updatedAt' | 'updatedBy'>>): Promise<void> {
    const now = Timestamp.now();
    const currentUid = this.authService.user()?.uid;
    if (!currentUid) throw new Error('No hay usuario autenticado.');

    const docRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(docRef, {
      ...data,
      updatedAt: now,
      updatedBy: currentUid
    });
    // Si quieres actualizar el cache de inmediato:
    // this.listenAllUsers();
  }

  /** Elimina usuario en Firestore **/
  async deleteUser(uid: string) {
    const docRef = doc(this.firestore, `users/${uid}`);
    await deleteDoc(docRef);
    // Si quieres actualizar el cache de inmediato:
    // this.listenAllUsers();
  }
}
