import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { BranchesModule } from '../branches/branches.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [BranchesModule, PlansModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
