import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // NOTE: These are placeholders. You'll need to sign up for EmailJS (https://www.emailjs.com/)
  // and replace these with your actual IDs to make the form send real emails.
  private readonly SERVICE_ID = 'service_bh3ada4'; // Updated from screenshot
  private readonly TEMPLATE_ID = 'template_v89a90q'; // Placeholder
  private readonly PUBLIC_KEY = 'rffpNnaC5mSp37AWC'; // Placeholder

  constructor() {
    emailjs.init({
        publicKey: this.PUBLIC_KEY,
    });
  }

  /**
   * Sends a contact email using EmailJS.
   * @param data The form data (name, email, message)
   * @returns A promise that resolves when the email is sent.
   */
  async sendContactEmail(data: { name: string; email: string; message: string }): Promise<any> {
    const templateParams = {
      from_name: data.name,
      from_email: data.email,
      message: `Sender Name: ${data.name}\nSender Email: ${data.email}\n\nMessage:\n${data.message}`,
      to_email: 'rahulpbu@gmail.com'
    };

    // No check needed now that keys are set
    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams,
        this.PUBLIC_KEY
      );
      return response;
    } catch (error) {
      console.error('EmailJS Error:', error);
      throw error;
    }
  }
}
