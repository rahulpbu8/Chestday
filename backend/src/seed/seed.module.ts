import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Product } from '../products/product.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Plan } from '../plans/entities/plan.entity';

import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Branch, Plan, User])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
