import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'confirm' | 'error' | 'success';
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalState = new BehaviorSubject<{
    isOpen: boolean;
    config?: ModalConfig;
    resolve?: (result: boolean) => void;
  }>({ isOpen: false });

  modalState$ = this.modalState.asObservable();

  confirm(config: ModalConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalState.next({
        isOpen: true,
        config: { ...config, type: config.type || 'confirm' },
        resolve,
      });
    });
  }

  showInfo(config: ModalConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalState.next({
        isOpen: true,
        config: { ...config, type: config.type || 'info', cancelText: '' },
        resolve,
      });
    });
  }

  close(result: boolean) {
    const current = this.modalState.getValue();
    this.modalState.next({ isOpen: false });
    if (current.resolve) {
      const resolveFn = current.resolve;
      setTimeout(() => resolveFn(result), 10);
    }
  }
}
