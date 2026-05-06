import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api/api';
import { EmailService } from '../../core/services/email/email';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss'],
  standalone: false,
})
export class Contact implements OnInit {
  contactForm!: FormGroup;
  submitted = false;
  success = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private emailService: EmailService
  ) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  async onSubmit() {
    this.submitted = true;
    if (this.contactForm.invalid) return;

    this.loading = true;
    let emailSent = false;

    try {
      // 1. Try to send via EmailJS
      await this.emailService.sendContactEmail(this.contactForm.value);
      emailSent = true;
    } catch (error) {
      console.error('Email delivery error:', error);
    }

    // 2. Always try to save to local DB
    this.api.post('contacts', this.contactForm.value).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        if (!emailSent) {
           alert('Message saved to our database, but email delivery failed. Please check your EmailJS credentials in email.ts!');
        }
        this.contactForm.reset();
        this.submitted = false;
      },
      error: (err: any) => {
        console.error('Error saving to DB:', err);
        this.loading = false;
        if (emailSent) {
          this.success = true;
          this.contactForm.reset();
          this.submitted = false;
        } else {
          alert('Failed to send message. Please contact us via WhatsApp!');
        }
      }
    });
  }

  openWhatsApp() {
    const phone = '917025503248'; // 7025503248 with 91 prefix
    const message = `Hi, I'm interested in Chest Day Gym! My name is ${this.contactForm.value.name || '[Your Name]'}.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}
