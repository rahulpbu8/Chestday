import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { PlansService } from './plans/plans.service';
import { MembershipStatus } from './users/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const plansService = app.get(PlansService);

  const email = 'member1@chestday.com';
  console.log(`Searching for user: ${email}`);
  
  const user = await usersService.findOneByEmail(email);
  if (!user) {
    console.error('User not found. Please register first.');
    await app.close();
    return;
  }

  const plansResult = await plansService.findAll();
  const plans = plansResult.data;
  
  if (plans.length === 0) {
    console.error('No plans found. Seeding plans first...');
    await app.close();
    return;
  }

  const activePlan = plans[0]; // Just take the first one (e.g. Monthly)
  
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  await usersService.update(user.id, {
    currentPlan: activePlan,
    membershipStatus: MembershipStatus.ACTIVE,
    membershipExpiry: expiryDate,
    phone: '123-456-7890',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '987-654-3210'
  });

  console.log(`Successfully updated membership for ${user.name}`);
  console.log(`Plan: ${activePlan.name}`);
  console.log(`Expiry: ${expiryDate.toISOString()}`);

  await app.close();
}

bootstrap();
