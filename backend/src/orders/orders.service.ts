import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  async createOrder(userId: string, orderData: any): Promise<Order> {
    const { items, addressId, totalAmount, paymentMethod } = orderData;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the Order
      const order = queryRunner.manager.create(Order, {
        userId,
        addressId,
        totalAmount,
        paymentMethod,
        status: OrderStatus.PAID, // Simulate successful payment
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // 2. Process items and update stock
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: item.productId } });
        
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }

        // Reduce stock
        product.stock -= item.quantity;
        await queryRunner.manager.save(Product, product);

        // Create Order Item
        const orderItem = queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: product.id,
          quantity: item.quantity,
          price: product.price, // Store current price
        });

        orderItems.push(await queryRunner.manager.save(OrderItem, orderItem));
      }

      savedOrder.items = orderItems;
      await queryRunner.commitTransaction();
      return savedOrder;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByUserId(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { userId },
      relations: ['items', 'items.product', 'address'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, userId },
      relations: ['items', 'items.product', 'address'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
  async findAllOrdersAdmin(page: number = 1, limit: number = 10, search: string = ''): Promise<{ data: Order[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.ordersRepository.findAndCount({
      relations: ['user', 'items', 'items.product', 'address'],
      where: search ? [
        { user: { name: ILike(`%${search}%`) } },
        { user: { email: ILike(`%${search}%`) } },
      ] : {},
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip
    });

    return { data, total };
  }

  async findOneOrderAdmin(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'address'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
