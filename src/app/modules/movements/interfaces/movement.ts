import {Timestamp} from '@angular/fire/firestore';

export interface Movement {
  id: string;
  type: "INGRESO" | "EGRESO";
  paymentMethod: "EFECTIVO" | "YAPE" | "TARJETA" | "TRANSFERENCIA";
  group: string;
  description: string;
  amount: number;
  receiptUrl: string;
  comments: string;

  createdBy: string;
  createdAt: Timestamp;
  updatedBy: string;
  updatedAt: Timestamp;
}
