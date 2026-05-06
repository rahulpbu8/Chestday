import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchesRepository: Repository<Branch>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, search: string = ''): Promise<{ data: Branch[], total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.branchesRepository.findAndCount({
      where: search ? [
        { city: ILike(`%${search}%`) },
        { location: ILike(`%${search}%`) }
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

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async create(branchData: Partial<Branch>): Promise<Branch> {
    const branch = this.branchesRepository.create(branchData);
    return this.branchesRepository.save(branch);
  }

  async update(id: string, branchData: Partial<Branch>): Promise<Branch> {
    await this.findOne(id);
    await this.branchesRepository.update(id, branchData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchesRepository.remove(branch);
  }
}
