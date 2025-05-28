import {computed, Injectable, signal} from '@angular/core';

export interface ToastMessage {
  text: string;
  type?: 'success' | 'danger' | 'info' | 'warning';
  delay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messagesSignal = signal<ToastMessage[]>([]);
  public messages = computed(() => this.messagesSignal());

  show(text: string, type: ToastMessage['type'] = 'info', delay = 3000) {
    const msg: ToastMessage = { text, type, delay };
    this.messagesSignal.set([...this.messagesSignal(), msg]);
    setTimeout(() => this.remove(msg), delay);
  }

  remove(msg: ToastMessage) {
    this.messagesSignal.set(this.messagesSignal().filter(m => m !== msg));
  }
}
