import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMembership } from './entities/user-membership.entity';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserMembership])],
  providers: [MembershipsService],
  controllers: [MembershipsController],
  exports: [MembershipsService]
})
export class MembershipsModule {}
