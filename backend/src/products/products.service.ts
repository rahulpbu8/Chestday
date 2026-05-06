import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, search: string = ''): Promise<{ data: Product[], total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.productsRepository.findAndCount({
      where: search ? [
        { name: ILike(`%${search}%`) },
        { category: ILike(`%${search}%`) }
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

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(productData);
    return this.productsRepository.save(product);
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const product = await this.findOne(id);
    const updatedProduct = this.productsRepository.merge(product, productData);
    return this.productsRepository.save(updatedProduct);
  }

  async checkStock(id: string, quantity: number): Promise<boolean> {
    const product = await this.findOne(id);
    return product.stock >= quantity;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
