import {Timestamp} from '@angular/fire/firestore';

export interface Movement {
  id: string;
  type: "INGRESO" | "EGRESO";
  paymentMethod: "EFECTIVO" | "YAPE" | "TARJETA" | "TRANSFERENCIA";
  description: string;
  amount: number;
  receiptUrl: string;
  comments: string;

  createdBy: string;
  createdByName?: string;
  createdAt: Timestamp;
  updatedBy: string;
  updatedByName?: string;
  updatedAt: Timestamp
}
