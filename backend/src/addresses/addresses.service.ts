import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressesRepository: Repository<Address>,
  ) {}

  async create(userId: string, addressData: Partial<Address>): Promise<Address> {
    const address = this.addressesRepository.create({
      ...addressData,
      userId,
    });

    if (address.isDefault) {
      await this.resetDefault(userId);
    } else {
      // If no default address exists, make this one default
      const defaultExists = await this.addressesRepository.findOne({ where: { userId, isDefault: true } });
      if (!defaultExists) {
        address.isDefault = true;
      }
    }

    return this.addressesRepository.save(address);
  }

  async findAllByUserId(userId: string): Promise<Address[]> {
    return this.addressesRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Address | null> {
    return this.addressesRepository.findOne({ where: { id, userId } });
  }

  async update(id: string, userId: string, addressData: Partial<Address>): Promise<Address> {
    const address = await this.findOne(id, userId);
    if (!address) throw new Error('Address not found');

    if (addressData.isDefault && !address.isDefault) {
      await this.resetDefault(userId);
    }

    Object.assign(address, addressData);
    return this.addressesRepository.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);
    if (!address) throw new Error('Address not found');
    await this.addressesRepository.remove(address);
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    await this.resetDefault(userId);
    const address = await this.findOne(id, userId);
    if (!address) throw new Error('Address not found');
    address.isDefault = true;
    return this.addressesRepository.save(address);
  }

  private async resetDefault(userId: string): Promise<void> {
    await this.addressesRepository.update({ userId, isDefault: true }, { isDefault: false });
  }
}
