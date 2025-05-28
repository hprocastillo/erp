import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
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
import {deleteObject, getDownloadURL, ref, Storage, uploadBytes} from '@angular/fire/storage';
import {Movement} from './interfaces/movement';
import {AuthService} from '../auth/auth.service';
import {UsersService} from '../users/users.service';

@Injectable({providedIn: 'root'})
export class MovementsService {
  /** injects **/
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private auth = inject(AuthService);
  private usersService = inject(UsersService);

  /** signals **/
  private movementsSignal: WritableSignal<(Movement & {
    createdByName?: string,
    updatedByName?: string
  })[] | null> = signal(null);
  public movements = computed(() => this.movementsSignal() ?? []);

  /** variables **/
  private isListening = false;
  private movementsSub: any = null;

  /** lista de todos los movimientos, enriquecido con los datos del usuario **/
  getAllMovements(): void {
    if (this.isListening) return;
    const ref = collection(this.firestore, 'movements');
    this.movementsSub = collectionData(ref, {idField: 'id'}).subscribe((data) => {
      const users = this.usersService.users();
      const movsEnriched = (data as Movement[]).map(mov => ({
        ...mov,
        createdByName: users.find(u => u.uid === mov.createdBy)?.displayName ?? mov.createdBy,
        updatedByName: users.find(u => u.uid === mov.updatedBy)?.displayName ?? mov.updatedBy,
      }));
      this.movementsSignal.set(movsEnriched);
    });
    this.isListening = true;
  }

  stopListening(): void {
    this.movementsSub?.unsubscribe();
    this.movementsSignal.set(null);
    this.isListening = false;
  }

  /** ********************* **/
  /** Listar usuario por Id **/
  getMovementById(id: string) {
    const docRef = doc(this.firestore, `movements/${id}`);
    return getDoc(docRef);
  }

  /** ****************** **/
  /** Agregar movimiento **/
  async createMovement(data: any, file?: File): Promise<void> {
    const now = Timestamp.now();
    const uid = this.auth.uid;
    let receiptUrl = '';

    if (file) {
      const storageRef = ref(this.storage, `receipts/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      receiptUrl = await getDownloadURL(storageRef);
    }

    const docRef = doc(collection(this.firestore, 'movements'));
    await setDoc(docRef, {
      ...data,
      amount: Number(data.amount),
      receiptUrl,
      createdBy: uid,
      createdAt: now,
      updatedBy: uid,
      updatedAt: now,
    });
  }

  /** ********************* **/
  /** Actualizar movimiento **/
  async update(id: string, data: any, file?: File): Promise<void> {
    const now = Timestamp.now();
    const uid = this.auth.uid;
    let receiptUrl = data.receiptUrl ?? '';

    if (file) {
      const storageRef = ref(this.storage, `receipts/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      receiptUrl = await getDownloadURL(storageRef);
    }

    const docRef = doc(this.firestore, `movements/${id}`);
    await updateDoc(docRef, {
      ...data,
      amount: Number(data.amount),
      receiptUrl,
      updatedBy: uid,
      updatedAt: now,
    });
  }

  /** ***************** **/
  /** Borrar movimiento **/
  async delete(id: string, receiptUrl?: string): Promise<void> {
    const docRef = doc(this.firestore, `movements/${id}`);
    await deleteDoc(docRef);

    /** Eliminar recibo del storage si existe **/
    if (receiptUrl) {
      try {
        const fileRef = ref(this.storage, receiptUrl);
        await deleteObject(fileRef);
      } catch {
      }
    }
  }
}
