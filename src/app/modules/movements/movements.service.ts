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
import {deleteObject, getDownloadURL, ref, Storage, uploadBytes} from '@angular/fire/storage';
import {Movement} from './interfaces/movement';
import {AuthService} from '../auth/auth.service';
import {from} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovementsService {
  /** injects **/
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private auth = inject(AuthService);

  /** Signal reactiva para todos los movimientos (puedes usarla en listas) **/
  private movementsSignal = signal<Movement[]>([]);
  movements = computed(() => this.movementsSignal());

  /** Obtener todos los movimientos (en tiempo real) **/
  listenAll() {
    const col = collection(this.firestore, 'movements');
    collectionData(col, {idField: 'id'}).subscribe(data => {
      this.movementsSignal.set(data as Movement[]);
    });
  }

  /** Obtener detalle por id **/
  getById(id: string) {
    const docRef = doc(this.firestore, `movements/${id}`);
    return from(getDoc(docRef)).pipe(
      // .pipe para integrarlo con signals/observables
    );
  }

  /** Crear movimiento (y subir recibo si hay) **/
  async create(movement: Omit<Movement, 'id' | 'receiptUrl' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>, receiptFile?: File): Promise<void> {
    let receiptUrl = '';
    if (receiptFile) {
      const filePath = `receipts/${Date.now()}_${receiptFile.name}`;
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, receiptFile);
      receiptUrl = await getDownloadURL(storageRef);
    }
    const now = Timestamp.now();
    const uid = this.auth.uid!;
    const docRef = doc(collection(this.firestore, 'movements'));
    const newMovement: Movement = {
      ...movement,
      id: docRef.id,
      receiptUrl,
      createdBy: uid,
      createdAt: now,
      updatedBy: uid,
      updatedAt: now
    };
    await setDoc(docRef, newMovement);
  }

  /** Actualizar movimiento (opcional: subir nuevo recibo) **/
  async update(id: string, movement: Partial<Movement>, receiptFile?: File): Promise<void> {
    const docRef = doc(this.firestore, `movements/${id}`);
    let receiptUrl = movement.receiptUrl ?? '';

    if (receiptFile) {
      const filePath = `receipts/${Date.now()}_${receiptFile.name}`;
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, receiptFile);
      receiptUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(docRef, {
      ...movement,
      receiptUrl,
      updatedBy: this.auth.uid,
      updatedAt: Timestamp.now()
    });
  }

  /** Eliminar movimiento y recibo (opcional) **/
  async delete(id: string, receiptUrl?: string): Promise<void> {
    const docRef = doc(this.firestore, `movements/${id}`);
    await deleteDoc(docRef);
    if (receiptUrl) {
      try {
        const storageRef = ref(this.storage, receiptUrl);
        await deleteObject(storageRef);
      } catch {
      }
    }
  }
}
