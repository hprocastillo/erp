import {computed, inject, Injectable, signal} from '@angular/core';
import {Auth, authState, onAuthStateChanged, signInWithEmailAndPassword, signOut, User} from '@angular/fire/auth';
import {doc, Firestore, getDoc, setDoc, Timestamp, updateDoc} from '@angular/fire/firestore';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  public userGuard$ = authState(inject(Auth));

  /** SIGNAL para el usuario autenticado (null si no está logueado) **/
  private userSignal = signal<User | null>(null);

  /** Exponemos como readonly signal (solo lectura) **/
  public user = computed(() => this.userSignal());

  constructor() {
    /** Escucha cambios de autenticación **/
    onAuthStateChanged(this.auth, async (firebaseUser: any) => {
      this.userSignal.set(firebaseUser);
      if (firebaseUser) {
        /** Al loguearse, solo crea el usuario si es nuevo **/
        await this.createUserIfNotExists(firebaseUser);
        /** Siempre actualiza el lastLogin si ya existe **/
        await this.updateLastLogin(firebaseUser.uid);
      }
    });
  }

  /** Login con email y password **/
  async login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);

    /** userSignal se actualizará automáticamente por el listener **/
    return credential.user;
  }

  /** Logout **/
  async logout() {
    await signOut(this.auth);
    this.userSignal.set(null);
    await this.router.navigate(['/auth']);
  }

  /** Verifica si hay usuario logueado **/
  isLoggedIn() {
    return !!this.userSignal();
  }

  /**
   * Crea el documento del usuario en Firestore
   **/
  private async createUserIfNotExists(user: User): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      const now: Timestamp = Timestamp.now();
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        role: 'USUARIO',
        displayName: user.email,
        createdBy: user.uid,
        createdAt: now,
      });
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    const now: Timestamp = Timestamp.now();
    await updateDoc(userRef, {
      lastLogin: now,
      updatedAt: now,
      updatedBy: uid,
    });
  }

  /** Acceso al uid, email, etc. **/
  get uid() {
    return this.userSignal()?.uid || null;
  }

  get email() {
    return this.userSignal()?.email || null;
  }

  get displayName() {
    return this.userSignal()?.displayName || null;
  }
}
