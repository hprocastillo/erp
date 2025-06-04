import {computed, inject, Injectable, signal} from '@angular/core';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User
} from '@angular/fire/auth';
import {doc, Firestore, getDoc, setDoc, Timestamp, updateDoc} from '@angular/fire/firestore';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** injects **/
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

  /** Login SOLO con Google **/
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
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
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        firstLogin: Timestamp.now(),
      });
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, {
      lastLogin: Timestamp.now(),
    });
  }

  /** Acceso al uid, email, etc. **/
  get uid(): string | null {
    return this.userSignal()?.uid || null;
  }

  get email(): string | null {
    return this.userSignal()?.email || null;
  }

  get displayName(): string | null {
    return this.userSignal()?.displayName || null;
  }

  get photoURL(): string | null {
    return this.userSignal()?.photoURL || null;
  }
}
