import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { Payment } from '../payments/entities/payment.entity';
import { MembershipsService } from '../memberships/memberships.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private configService: ConfigService,
    private membershipsService: MembershipsService,
  ) { }

  async onModuleInit() {
    const adminEmail = this.configService.get<string>('DEFAULT_ADMIN_EMAIL') || 'admin@chestday.com';
    const adminPassword = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD') || 'SuperAdmin123!';

    const adminExists = await this.usersRepository.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      console.log('Seeding Super Admin...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const superAdmin = this.usersRepository.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
      });
      await this.usersRepository.save(superAdmin);
      console.log('Super Admin seeded successfully.');
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role'] // Include password for login
    });
  }

  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'password']
    });
    if (!user) return false;
    return bcrypt.compare(password, user.password);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['branch', 'currentPlan', 'payments', 'payments.plan']
    });

    if (user && user.membershipExpiry && user.membershipExpiry < new Date() && user.membershipStatus === 'active') {
      user.membershipStatus = 'expired' as any;
      await this.usersRepository.save(user);
    }

    return user;
  }

  async findMembers(page: number = 1, limit: number = 10, search: string = ''): Promise<{ data: User[], total: number }> {
    const query = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.branch', 'branch')
      .leftJoinAndSelect('user.currentPlan', 'plan')
      .where('user.role = :role', { role: UserRole.USER });

    if (search) {
      query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)', { search: `%${search}%` });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    // Check for expired memberships on the fly for the current page
    for (const user of data) {
      if (user.membershipExpiry && user.membershipExpiry < new Date() && user.membershipStatus === 'active') {
        user.membershipStatus = 'expired' as any;
        await this.usersRepository.save(user);
      }
    }

    return { data, total };
  }

  async create(userData: Partial<User>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findAll(page: number = 1, limit: number = 10, search: string = '', excludeId?: string): Promise<{ data: User[], total: number }> {
    const query = this.usersRepository.createQueryBuilder('user')
      .where('user.role IN (:...roles)', { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] });

    if (search) {
      query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
    }

    if (excludeId) {
      query.andWhere('user.id != :excludeId', { excludeId });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // Merge updates
    const updatedUser = this.usersRepository.merge(user, userData);
    return this.usersRepository.save(updatedUser);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
  async activateManual(userId: string, paymentId: string): Promise<User> {
    console.log(`UsersService: Starting manual activation for user ${userId}, payment ${paymentId}`);
    
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['branch'] // Only need branch for history
    });

    if (!user) {
      console.error(`UsersService: User ${userId} not found`);
      throw new Error('User not found');
    }

    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['plan']
    });

    if (!payment) {
      console.error(`UsersService: Payment record ${paymentId} not found`);
      throw new Error('Payment record not found');
    }
    
    if (payment.status === 'activated') {
      console.warn(`UsersService: Payment ${paymentId} already used for activation`);
      return user; 
    }

    const plan = payment.plan;
    if (!plan) {
        console.error(`UsersService: Plan missing for payment ${paymentId}`);
        throw new Error('Plan not associated with this payment');
    }

    const expiryDate = new Date();
    const period = (plan.period || 'monthly').toLowerCase();

    if (period.includes('year') || period === 'yr') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else if (period.includes('quarter') || period === '3mo') {
      expiryDate.setMonth(expiryDate.getMonth() + 3);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    // Update User
    user.planId = plan.id;
    user.currentPlan = plan;
    user.membershipStatus = 'active' as any;
    user.membershipExpiry = expiryDate;

    console.log(`UsersService: Updating user ${user.name} with plan ${plan.name} expiring ${expiryDate.toISOString()}`);
    const savedUser = await this.usersRepository.save(user);

    // Update Payment Status
    payment.status = 'activated' as any;
    await this.paymentRepository.save(payment);

    // Create Membership History Snapshot
    console.log(`UsersService: Snapshotting membership history for user ${user.name}`);
    try {
      await this.membershipsService.create({
        userId: user.id,
        userName: user.name || 'Unknown',
        planId: plan.id,
        planName: plan.name || 'Unknown',
        amount: Number(plan.priceValue) || 0,
        expiryDate: expiryDate,
        branchId: user.branchId || undefined,
        branchName: user.branch ? `${user.branch.city} - ${user.branch.location}` : 'No branch assigned'
      });
      console.log(`UsersService: History snapshot created successfully`);
    } catch (historyError) {
      console.error('UsersService: NON-FATAL ERROR creating history snapshot:', historyError);
      // Not throwing here to allow the main activation to persist
    }

    return savedUser;
  }
}
