import {inject, Injectable} from '@angular/core';
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
import {AuthService} from '../auth/auth.service';
import {UsersService} from '../users/users.service';
import {Movement} from './interfaces/movement';
import {combineLatest, map, Observable} from 'rxjs';
import { User } from '../users/interfaces/user';

@Injectable({providedIn: 'root'})
export class MovementsService {
  /** injects **/
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private auth = inject(AuthService);
  private usersService = inject(UsersService);

  /** ******************************************************** **/
  /** Traer todos los movimientos, con displayName enriquecido **/
  getAllMovements(): Observable<Movement[]> {
    const movementsRef = collection(this.firestore, 'movements');
    const usersRef = collection(this.firestore, 'users');
    return combineLatest([
      collectionData(movementsRef, { idField: 'id' }) as Observable<Movement[]>,
      collectionData(usersRef, { idField: 'uid' }) as Observable<User[]>
    ]).pipe(
      map(([movements, users]) =>
        movements.map(movement => ({
          ...movement,
          createdByName: users.find(u => u.uid === movement.createdBy)?.displayName || 'Usuario desconocido',
          updatedByName: users.find(u => u.uid === movement.updatedBy)?.displayName || 'Usuario desconocido',
        }))
      )
    );
  }

  getAllUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'uid' }) as Observable<User[]>;
  }
  // getAllMovements(): Observable<Movement[]> {
  //   const movementsRef = collection(this.firestore, 'movements');
  //   const usersRef = collection(this.firestore, 'users');
  //   return combineLatest([
  //     collectionData(movementsRef, { idField: 'id' }) as Observable<Movement[]>,
  //     collectionData(usersRef, { idField: 'uid' }) as Observable<User[]>
  //   ]).pipe(
  //     map(([movements, users]) =>
  //       movements.map(movement => ({
  //         ...movement,
  //         createdByName: users.find(u => u.uid === movement.createdBy)?.displayName || 'Usuario desconocido',
  //         updatedByName: users.find(u => u.uid === movement.updatedBy)?.displayName || 'Usuario desconocido',
  //       }))
  //     )
  //   );
  // }

  /** *************************** **/
  /***** Listar usuario por Id *****/
  getMovementById(id: string) {
    const docRef = doc(this.firestore, `movements/${id}`);
    return getDoc(docRef);
  }

  /** ************************ **/
  /***** Agregar movimiento *****/
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

  /** *************************** **/
  /***** Actualizar movimiento *****/
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

  /** ************************* **/
  /***** Borrar movimiento *******/
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
