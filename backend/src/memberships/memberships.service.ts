import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { UserMembership } from './entities/user-membership.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(UserMembership)
    private readonly membershipRepository: Repository<UserMembership>,
  ) { }

  async create(data: Partial<UserMembership>): Promise<UserMembership> {
    console.log(`MembershipsService: Creating record for user ${data.userName}, plan ${data.planName}`);
    const membership = this.membershipRepository.create(data);
    const saved = await this.membershipRepository.save(membership);
    console.log(`MembershipsService: Record saved with ID ${saved.id}`);
    return saved;
  }

  async findAll(page: number = 1, limit: number = 10, search: string = ''): Promise<{ data: UserMembership[], total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.membershipRepository.findAndCount({
      where: search ? [
        { userName: Like(`%${search}%`) },
        { planName: Like(`%${search}%`) },
        { branchName: Like(`%${search}%`) }
      ] : {},
      relations: ['user', 'plan', 'branch'],
      order: { activatedAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { data, total };
  }
}
