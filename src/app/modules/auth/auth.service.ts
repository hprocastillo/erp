import {computed, inject, Injectable, signal} from '@angular/core';
import {Auth, authState, onAuthStateChanged, signInWithEmailAndPassword, signOut, User} from '@angular/fire/auth';
import {doc, Firestore, setDoc, Timestamp} from '@angular/fire/firestore';
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
  user = computed(() => this.userSignal());

  constructor() {
    /** Escucha cambios de autenticación **/
    onAuthStateChanged(this.auth, async (firebaseUser: any) => {
      this.userSignal.set(firebaseUser);
      if (firebaseUser) {
        /** Al loguearse, guarda (o actualiza) los datos en "users" **/
        await this.createOrUpdateUser(firebaseUser);
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

    /** Redirigimos al login (opcional) **/
    await this.router.navigate(['/auth']);
  }

  /** Verifica si hay usuario logueado **/
  isLoggedIn() {
    return !!this.userSignal();
  }

  /**
   * Crea o actualiza el documento del usuario en Firestore.
   * Así tienes la información SIEMPRE actualizada cada vez que loguea.
   **/
  private async createOrUpdateUser(user: User) {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      lastLogin: Timestamp.now()
    }, {merge: true});
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
