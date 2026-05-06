import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BranchesService } from '../branches/branches.service';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private branchesService: BranchesService,
    private plansService: PlansService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      console.log(`ChatService: Initializing Gemini with key starting with: ${apiKey.substring(0, 8)}...`);
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use the explicit models/ prefix which is more compatible across SDK versions
      this.model = this.genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
    } else {
      console.warn('ChatService: GEMINI_API_KEY is missing from environment.');
    }
  }

  async getResponse(message: string, history: { role: string; parts: string }[]) {
    if (!this.model) {
      return {
        text: "I'm sorry, but the AI service is not configured yet. Please provide a GEMINI_API_KEY in the environment variables.",
      };
    }

    try {
      // Fetch real-time info
      const branches = await this.branchesService.findAll(1, 100);
      const plans = await this.plansService.findAll(1, 100);

      const branchInfo = branches.data.map(b => `- ${b.city}: ${b.location}`).join('\n');
      const planInfo = plans.data.map(p => `- ${p.name}: ${p.price} (${p.period})`).join('\n');

      const systemInstruction = `
        You are "Aura", the AI assistant for Chest Day Gym. 
        You are helpful, motivating, and professional.
        
        Real-time Information:
        
        Available Branches:
        ${branchInfo}
        
        Membership Plans:
        ${planInfo}
        
        Guidelines:
        1. Use the information above to answer queries about locations and pricing.
        2. If asked about something not mentioned, be polite and suggest contacting human support.
        3. Be concise and use a motivating gym-style tone.
      `;

      // Map history to the correct format expected by the SDK
      const formattedHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.parts }]
      }));

      const chat = this.model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      // We append system context to the first message if history is empty, or just prefix the message
      const prompt = history.length === 0 
        ? `${systemInstruction}\n\nUser: ${message}`
        : message;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return { text: response.text() };
    } catch (error) {
      console.error('ChatService Error:', error);
      if (error.response) {
        console.error('Gemini API Error Response:', error.response.data || error.response);
      }
      return { text: "I'm having a bit of a heavy lifting day and couldn't process that. Please try again later!" };
    }
  }
}
