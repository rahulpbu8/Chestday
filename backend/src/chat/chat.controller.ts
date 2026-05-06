import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async getChatResponse(
    @Body() body: { message: string; history: { role: string; parts: string }[] },
  ) {
    return this.chatService.getResponse(body.message, body.history || []);
  }
}
