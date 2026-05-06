import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Plan } from './entities/plan.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly plansRepository: Repository<Plan>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, search: string = ''): Promise<{ data: Plan[], total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.plansRepository.findAndCount({
      where: search ? [
        { name: ILike(`%${search}%`) }
      ] : {},
      order: {
        createdAt: 'ASC',
        id: 'ASC'
      },
      take: limit,
      skip: skip
    });
    return { data, total };
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.plansRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async create(planData: Partial<Plan>): Promise<Plan> {
    const plan = this.plansRepository.create(planData);
    return this.plansRepository.save(plan);
  }

  async update(id: string, planData: Partial<Plan>): Promise<Plan> {
    await this.findOne(id);
    await this.plansRepository.update(id, planData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await this.plansRepository.remove(plan);
  }
}
