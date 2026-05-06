import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ApiService } from '../../../core/services/api/api';

interface Message {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: false,
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss'
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  isOpen = false;
  userInput = '';
  messages: Message[] = [
    { role: 'model', text: 'Hey there! I am Aura, your Chest Day AI assistant. How can I help you crush your goals today?' }
  ];
  isLoading = false;

  constructor(private api: ApiService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMsg = this.userInput.trim();
    this.messages.push({ role: 'user', text: userMsg });
    this.userInput = '';
    this.isLoading = true;

    // Construct history for Gemini (excluding the last system prompt logic which is on backend)
    const history = this.messages.slice(0, -1).map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: m.text
    }));

    this.api.post('chat', { message: userMsg, history }).subscribe({
      next: (res: any) => {
        this.messages.push({ role: 'model', text: res.text });
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Chat Error:', err);
        this.messages.push({ role: 'model', text: "Sorry, I'm having some trouble connecting to my gym brain. Please try again later!" });
        this.isLoading = false;
      }
    });
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
