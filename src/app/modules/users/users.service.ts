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
import {from, Subscription} from 'rxjs';
import {User} from './interfaces/user';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  /** injects **/
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  /** Signal cache en memoria para la lista de usuarios **/
  private usersSignal = signal<User[] | null>(null);
  public users = computed(() => this.usersSignal() ?? []);
  private usersSub: Subscription | null = null;
  private isListening = false;

  /** Escucha todos los usuarios solo una vez por sesión (real time y cache) **/
  listenAllUsers(): void {
    if (this.isListening) return;
    const ref = collection(this.firestore, 'users');
    this.usersSub = collectionData(ref, {idField: 'uid'}).subscribe(
      data => {
        this.usersSignal.set(data as User[]);
        this.isListening = true;
      });
  }

  enrichedUsers = computed(() => {
    const users: User[] = this.users();
    /** Creamos un map UID => displayName para acceso rápido **/
    const uidToName = new Map(users.map(u => [u.uid, u.displayName]));
    return users.map(user => ({
      ...user,
      createdByName: uidToName.get(user.createdBy) ?? user.createdBy,
      updatedByName: uidToName.get(user.updatedBy) ?? user.updatedBy,
    }));
  });

  /** Opcional: Dejar de escuchar (por ejemplo, en logout) **/
  stopListening(): void {
    this.usersSub?.unsubscribe();
    this.usersSub = null;
    this.usersSignal.set(null);
    this.isListening = false;
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
