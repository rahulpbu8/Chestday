import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ModalService, ModalConfig } from '../../../core/services/modal/modal.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-modal',
  standalone: false,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(0.95)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ModalComponent implements OnInit {
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  
  isOpen = false;
  config: ModalConfig = { title: '', message: '' };

  ngOnInit() {
    this.modalService.modalState$.subscribe((state) => {
      this.isOpen = state.isOpen;
      if (state.config) {
        this.config = state.config;
      }
      this.cdr.detectChanges();
    });
  }

  getIcon(): string {
    switch (this.config.type) {
      case 'error': return 'error';
      case 'success': return 'check_circle';
      case 'info': return 'info';
      default: return 'help_outline';
    }
  }

  onConfirm() {
    this.modalService.close(true);
  }

  onCancel() {
    this.modalService.close(false);
  }
}
